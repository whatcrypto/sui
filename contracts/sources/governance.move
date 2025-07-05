// Governance Contract - Dispute resolution through token holder voting
module sweepstakes_platform::governance {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use sweepstakes_platform::sweep_token::{Self, SWEEP_TOKEN, PlatformTreasury, StakingRegistry};
    use sweepstakes_platform::sweepstakes::{Self, Dispute};

    // ===== Errors =====
    const ENotAuthorized: u64 = 0;
    const EInsufficientStake: u64 = 1;
    const EVotingNotActive: u64 = 2;
    const EAlreadyVoted: u64 = 3;
    const EVotingPeriodEnded: u64 = 4;
    const EQuorumNotMet: u64 = 5;
    const EInvalidVote: u64 = 6;
    const EVoteAlreadyResolved: u64 = 7;

    // ===== Constants =====
    const VOTING_PERIOD_MS: u64 = 604800000; // 7 days in milliseconds
    const QUORUM_PERCENTAGE: u64 = 10; // 10% of total staked tokens
    const VOTING_REWARD_PERCENTAGE: u64 = 1; // 1% of disputed amount as reward
    const MINIMUM_STAKE_TO_VOTE: u64 = 1000 * 100000000; // 1000 SWEEP tokens

    // ===== Structs =====

    /// Governance vote on dispute resolution
    struct GovernanceVote has key {
        id: UID,
        dispute_id: ID,
        sweepstakes_id: ID,
        dispute_title: String,
        dispute_description: String,
        host_proof: Option<String>,
        created_time: u64,
        voting_end_time: u64,
        votes_for_winner: u64, // Votes supporting the winner (dispute valid)
        votes_for_host: u64, // Votes supporting the host (dispute invalid)
        total_voting_power: u64,
        voters: Table<address, VoteRecord>,
        status: u8, // 0=Active, 1=Resolved_Winner, 2=Resolved_Host, 3=Quorum_Failed
        resolution_time: Option<u64>,
        reward_pool: Balance<SWEEP_TOKEN>,
    }

    /// Individual vote record
    struct VoteRecord has store {
        voter: address,
        vote: bool, // true = support winner, false = support host
        voting_power: u64,
        vote_time: u64,
        reward_claimed: bool,
    }

    /// Governance registry
    struct GovernanceRegistry has key {
        id: UID,
        active_votes: vector<ID>,
        completed_votes: vector<ID>,
        total_votes: u64,
        total_rewards_distributed: u64,
        governance_admin: address,
    }

    /// Voter rewards tracking
    struct VoterRewards has key {
        id: UID,
        voter: address,
        total_votes_cast: u64,
        total_rewards_earned: u64,
        unclaimed_rewards: Balance<SWEEP_TOKEN>,
        voting_history: vector<ID>,
    }

    // ===== Events =====

    struct GovernanceVoteCreated has copy, drop {
        vote_id: ID,
        dispute_id: ID,
        sweepstakes_id: ID,
        voting_end_time: u64,
        required_quorum: u64,
    }

    struct VoteCast has copy, drop {
        vote_id: ID,
        voter: address,
        vote: bool, // true = winner, false = host
        voting_power: u64,
        current_tally_winner: u64,
        current_tally_host: u64,
    }

    struct GovernanceVoteResolved has copy, drop {
        vote_id: ID,
        dispute_id: ID,
        sweepstakes_id: ID,
        resolution: String, // "winner" or "host" or "quorum_failed"
        final_tally_winner: u64,
        final_tally_host: u64,
        total_voting_power: u64,
        rewards_distributed: u64,
    }

    struct RewardsClaimed has copy, drop {
        voter: address,
        vote_id: ID,
        reward_amount: u64,
    }

    // ===== Init Function =====

    fun init(ctx: &mut TxContext) {
        let registry = GovernanceRegistry {
            id: object::new(ctx),
            active_votes: vector::empty(),
            completed_votes: vector::empty(),
            total_votes: 0,
            total_rewards_distributed: 0,
            governance_admin: tx_context::sender(ctx),
        };

        transfer::share_object(registry);
    }

    // ===== Public Functions =====

    /// Create governance vote for dispute resolution
    public entry fun create_governance_vote(
        registry: &mut GovernanceRegistry,
        dispute: &Dispute,
        reward_tokens: Coin<SWEEP_TOKEN>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Only governance admin can create votes (or authorized contracts)
        assert!(tx_context::sender(ctx) == registry.governance_admin, ENotAuthorized);

        let current_time = clock::timestamp_ms(clock);
        let voting_end_time = current_time + VOTING_PERIOD_MS;

        // Get dispute information
        let (sweepstakes_id, winner, host, dispute_reason, created_time, proof_submitted, proof_content, status) =
            sweepstakes::get_dispute_info(dispute);

        // Create governance vote
        let vote = GovernanceVote {
            id: object::new(ctx),
            dispute_id: object::id(dispute),
            sweepstakes_id,
            dispute_title: string::utf8(b"Dispute Resolution Vote"),
            dispute_description: dispute_reason,
            host_proof: proof_content,
            created_time: current_time,
            voting_end_time,
            votes_for_winner: 0,
            votes_for_host: 0,
            total_voting_power: 0,
            voters: table::new(ctx),
            status: 0, // Active
            resolution_time: option::none(),
            reward_pool: coin::into_balance(reward_tokens),
        };

        let vote_id = object::id(&vote);

        // Update registry
        vector::push_back(&mut registry.active_votes, vote_id);
        registry.total_votes = registry.total_votes + 1;

        // Calculate required quorum (placeholder - should be based on total staked)
        let required_quorum = 1000000 * 100000000; // 1M SWEEP tokens

        event::emit(GovernanceVoteCreated {
            vote_id,
            dispute_id: object::id(dispute),
            sweepstakes_id,
            voting_end_time,
            required_quorum,
        });

        transfer::share_object(vote);
    }

    /// Cast vote on governance proposal
    public entry fun cast_vote(
        vote: &mut GovernanceVote,
        treasury: &PlatformTreasury,
        staking_registry: &StakingRegistry,
        vote_choice: bool, // true = support winner, false = support host
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let voter = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Verify voting is active
        assert!(vote.status == 0, EVotingNotActive);
        assert!(current_time < vote.voting_end_time, EVotingPeriodEnded);

        // Check if already voted
        assert!(!table::contains(&vote.voters, voter), EAlreadyVoted);

        // Verify voter has sufficient stake
        assert!(sweep_token::has_voting_rights(treasury, staking_registry, voter), EInsufficientStake);

        // Calculate voting power based on staked tokens
        // For now, simplified - should query actual staking positions
        let voting_power = MINIMUM_STAKE_TO_VOTE; // Placeholder

        // Record vote
        let vote_record = VoteRecord {
            voter,
            vote: vote_choice,
            voting_power,
            vote_time: current_time,
            reward_claimed: false,
        };

        table::add(&mut vote.voters, voter, vote_record);

        // Update tallies
        if (vote_choice) {
            vote.votes_for_winner = vote.votes_for_winner + voting_power;
        } else {
            vote.votes_for_host = vote.votes_for_host + voting_power;
        };

        vote.total_voting_power = vote.total_voting_power + voting_power;

        event::emit(VoteCast {
            vote_id: object::id(vote),
            voter,
            vote: vote_choice,
            voting_power,
            current_tally_winner: vote.votes_for_winner,
            current_tally_host: vote.votes_for_host,
        });
    }

    /// Resolve governance vote after voting period ends
    public entry fun resolve_vote(
        registry: &mut GovernanceRegistry,
        vote: &mut GovernanceVote,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);

        // Verify voting period has ended
        assert!(current_time >= vote.voting_end_time, EVotingNotActive);
        assert!(vote.status == 0, EVoteAlreadyResolved);

        // Calculate required quorum (10% of total staked)
        let required_quorum = 1000000 * 100000000; // Placeholder - should be dynamic

        let resolution: String;
        let new_status: u8;

        if (vote.total_voting_power >= required_quorum) {
            // Quorum met - determine winner
            if (vote.votes_for_winner > vote.votes_for_host) {
                resolution = string::utf8(b"winner");
                new_status = 1; // Resolved for winner
            } else {
                resolution = string::utf8(b"host");
                new_status = 2; // Resolved for host
            };
        } else {
            // Quorum not met
            resolution = string::utf8(b"quorum_failed");
            new_status = 3; // Quorum failed
        };

        // Update vote
        vote.status = new_status;
        vote.resolution_time = option::some(current_time);

        // Move from active to completed
        let vote_id = object::id(vote);
        let (found, index) = vector::index_of(&registry.active_votes, &vote_id);
        if (found) {
            vector::remove(&mut registry.active_votes, index);
        };
        vector::push_back(&mut registry.completed_votes, vote_id);

        // Calculate rewards for distribution
        let reward_amount = balance::value(&vote.reward_pool);

        event::emit(GovernanceVoteResolved {
            vote_id,
            dispute_id: vote.dispute_id,
            sweepstakes_id: vote.sweepstakes_id,
            resolution,
            final_tally_winner: vote.votes_for_winner,
            final_tally_host: vote.votes_for_host,
            total_voting_power: vote.total_voting_power,
            rewards_distributed: reward_amount,
        });
    }

    /// Claim voting rewards
    public entry fun claim_voting_rewards(
        vote: &mut GovernanceVote,
        ctx: &mut TxContext
    ) {
        let voter = tx_context::sender(ctx);

        // Verify vote is resolved
        assert!(vote.status > 0, EVotingNotActive);

        // Verify voter participated
        assert!(table::contains(&vote.voters, voter), ENotAuthorized);

        let vote_record = table::borrow_mut(&mut vote.voters, voter);
        assert!(!vote_record.reward_claimed, EAlreadyVoted);

        // Calculate reward based on voting power
        let total_reward_pool = balance::value(&vote.reward_pool);
        let voter_reward = if (vote.total_voting_power > 0) {
            (vote_record.voting_power * total_reward_pool) / vote.total_voting_power
        } else {
            0
        };

        if (voter_reward > 0) {
            let reward_balance = balance::split(&mut vote.reward_pool, voter_reward);
            let reward_coin = coin::from_balance(reward_balance, ctx);

            vote_record.reward_claimed = true;

            event::emit(RewardsClaimed {
                voter,
                vote_id: object::id(vote),
                reward_amount: voter_reward,
            });

            transfer::public_transfer(reward_coin, voter);
        };
    }

    // ===== View Functions =====

    /// Get governance vote details
    public fun get_vote_info(vote: &GovernanceVote): (
        ID, // dispute_id
        ID, // sweepstakes_id
        String, // dispute_title
        String, // dispute_description
        Option<String>, // host_proof
        u64, // created_time
        u64, // voting_end_time
        u64, // votes_for_winner
        u64, // votes_for_host
        u64, // total_voting_power
        u8, // status
        Option<u64>, // resolution_time
        u64 // reward_pool_value
    ) {
        (
            vote.dispute_id,
            vote.sweepstakes_id,
            vote.dispute_title,
            vote.dispute_description,
            vote.host_proof,
            vote.created_time,
            vote.voting_end_time,
            vote.votes_for_winner,
            vote.votes_for_host,
            vote.total_voting_power,
            vote.status,
            vote.resolution_time,
            balance::value(&vote.reward_pool)
        )
    }

    /// Get voter's record for a specific vote
    public fun get_voter_record(vote: &GovernanceVote, voter: address): Option<(bool, u64, u64, bool)> {
        if (table::contains(&vote.voters, voter)) {
            let record = table::borrow(&vote.voters, voter);
            option::some((record.vote, record.voting_power, record.vote_time, record.reward_claimed))
        } else {
            option::none()
        }
    }

    /// Get governance registry stats
    public fun get_governance_stats(registry: &GovernanceRegistry): (u64, u64, u64, u64) {
        (
            vector::length(&registry.active_votes),
            vector::length(&registry.completed_votes),
            registry.total_votes,
            registry.total_rewards_distributed
        )
    }

    /// Check if vote meets quorum requirement
    public fun check_quorum(vote: &GovernanceVote): bool {
        let required_quorum = 1000000 * 100000000; // Placeholder
        vote.total_voting_power >= required_quorum
    }

    /// Get vote result
    public fun get_vote_result(vote: &GovernanceVote): (String, u64, u64) {
        let result = if (vote.votes_for_winner > vote.votes_for_host) {
            string::utf8(b"winner")
        } else if (vote.votes_for_host > vote.votes_for_winner) {
            string::utf8(b"host")
        } else {
            string::utf8(b"tie")
        };

        (result, vote.votes_for_winner, vote.votes_for_host)
    }

    // ===== Admin Functions =====

    /// Update governance admin
    public entry fun update_governance_admin(
        registry: &mut GovernanceRegistry,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.governance_admin, ENotAuthorized);
        registry.governance_admin = new_admin;
    }

    /// Emergency pause voting (admin only)
    public entry fun emergency_pause_vote(
        registry: &GovernanceRegistry,
        vote: &mut GovernanceVote,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.governance_admin, ENotAuthorized);
        vote.status = 3; // Paused/Failed
    }
}
