module sweepchain::governance {
    use sui::object::{UID, ID};
    use sui::tx_context::TxContext;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::vector;
    use std::string::{Self, String};
    use std::option;

    // Import from our own modules
    use sweepchain::sweep_token::{PlatformTreasury};

    // ===== Error Codes =====
    const ENotAuthorized: u64 = 0;
    const EProposalNotActive: u64 = 1;
    const EAlreadyVoted: u64 = 2;
    const EInsufficientStake: u64 = 3;
    const EVotingPeriodEnded: u64 = 4;

    // ===== Constants =====
    const MINIMUM_STAKE_TO_VOTE: u64 = 1000000000; // 1000 SWEEP tokens (with 6 decimals)
    const VOTING_PERIOD_MS: u64 = 604800000; // 7 days in milliseconds

    // ===== Structs =====

    /// Governance proposal for dispute resolution
    public struct DisputeProposal has key {
        id: UID,
        sweepstakes_id: String,
        winner: address,
        host: address,
        dispute_reason: String,
        proof_content: option::Option<String>,
        created_time: u64,
        voting_end_time: u64,
        votes_for_winner: u64,
        votes_for_host: u64,
        total_voting_power: u64,
        voters: Table<address, u64>, // voter -> voting power
        status: u8, // 0=Active, 1=Resolved_Winner, 2=Resolved_Host
    }

    /// Global governance registry
    public struct GovernanceRegistry has key {
        id: UID,
        active_proposals: vector<ID>,
        total_proposals: u64,
        total_voters: u64,
    }

    // ===== Events =====

    public struct ProposalCreated has copy, drop {
        proposal_id: ID,
        sweepstakes_id: String,
        winner: address,
        host: address,
        voting_end_time: u64,
    }

    public struct VoteCast has copy, drop {
        proposal_id: ID,
        voter: address,
        vote_for_winner: bool,
        voting_power: u64,
    }

    public struct ProposalResolved has copy, drop {
        proposal_id: ID,
        sweepstakes_id: String,
        winner_favored: bool,
        final_votes_winner: u64,
        final_votes_host: u64,
    }

    // ===== Functions =====

    fun init(ctx: &mut TxContext) {
        let registry = GovernanceRegistry {
            id: object::new(ctx),
            active_proposals: vector::empty(),
            total_proposals: 0,
            total_voters: 0,
        };

        transfer::share_object(registry);
    }

    /// Create a dispute proposal for governance voting
    public fun create_dispute_proposal(
        registry: &mut GovernanceRegistry,
        sweepstakes_id: String,
        winner: address,
        host: address,
        dispute_reason: String,
        proof_content: option::Option<String>,
        clock: &Clock,
        ctx: &mut TxContext
    ): ID {
        let current_time = clock::timestamp_ms(clock);
        let voting_end_time = current_time + VOTING_PERIOD_MS;

        let proposal = DisputeProposal {
            id: object::new(ctx),
            sweepstakes_id,
            winner,
            host,
            dispute_reason,
            proof_content,
            created_time: current_time,
            voting_end_time,
            votes_for_winner: 0,
            votes_for_host: 0,
            total_voting_power: 0,
            voters: table::new(ctx),
            status: 0, // Active
        };

        let proposal_id = object::id(&proposal);
        vector::push_back(&mut registry.active_proposals, proposal_id);
        registry.total_proposals = registry.total_proposals + 1;

        event::emit(ProposalCreated {
            proposal_id,
            sweepstakes_id,
            winner,
            host,
            voting_end_time,
        });

        transfer::share_object(proposal);
        proposal_id
    }

    /// Vote on a dispute proposal
    public fun vote_on_proposal(
        proposal: &mut DisputeProposal,
        vote_for_winner: bool,
        voting_power: u64, // Based on SWEEP token stake
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let voter = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Validate voting conditions
        assert!(proposal.status == 0, EProposalNotActive);
        assert!(current_time < proposal.voting_end_time, EVotingPeriodEnded);
        assert!(voting_power >= MINIMUM_STAKE_TO_VOTE, EInsufficientStake);
        assert!(!table::contains(&proposal.voters, voter), EAlreadyVoted);

        // Record vote
        table::add(&mut proposal.voters, voter, voting_power);
        proposal.total_voting_power = proposal.total_voting_power + voting_power;

        if (vote_for_winner) {
            proposal.votes_for_winner = proposal.votes_for_winner + voting_power;
        } else {
            proposal.votes_for_host = proposal.votes_for_host + voting_power;
        };

        event::emit(VoteCast {
            proposal_id: object::id(proposal),
            voter,
            vote_for_winner,
            voting_power,
        });
    }

    /// Resolve a dispute proposal after voting period ends
    public fun resolve_proposal(
        registry: &mut GovernanceRegistry,
        proposal: &mut DisputeProposal,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= proposal.voting_end_time, EVotingPeriodEnded);
        assert!(proposal.status == 0, EProposalNotActive);

        // Determine outcome
        let winner_favored = proposal.votes_for_winner > proposal.votes_for_host;
        proposal.status = if (winner_favored) 1 else 2;

        // Remove from active proposals
        let proposal_id = object::id(proposal);
        let (found, index) = vector::index_of(&registry.active_proposals, &proposal_id);
        if (found) {
            vector::remove(&mut registry.active_proposals, index);
        };

        event::emit(ProposalResolved {
            proposal_id,
            sweepstakes_id: proposal.sweepstakes_id,
            winner_favored,
            final_votes_winner: proposal.votes_for_winner,
            final_votes_host: proposal.votes_for_host,
        });
    }

    // ===== View Functions =====

    public fun get_proposal_info(proposal: &DisputeProposal): (
        String, address, address, String, u64, u64, u64, u64, u64, u8
    ) {
        (
            proposal.sweepstakes_id,
            proposal.winner,
            proposal.host,
            proposal.dispute_reason,
            proposal.created_time,
            proposal.voting_end_time,
            proposal.votes_for_winner,
            proposal.votes_for_host,
            proposal.total_voting_power,
            proposal.status
        )
    }

    public fun has_voted(proposal: &DisputeProposal, voter: address): bool {
        table::contains(&proposal.voters, voter)
    }

    public fun get_voter_power(proposal: &DisputeProposal, voter: address): u64 {
        if (table::contains(&proposal.voters, voter)) {
            *table::borrow(&proposal.voters, voter)
        } else {
            0
        }
    }
}
