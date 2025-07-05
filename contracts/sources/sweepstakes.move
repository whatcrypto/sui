// Sweepstakes Contract - Core sweepstakes functionality
module sweepstakes_platform::sweepstakes {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::random::{Self, Random};
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use sweepstakes_platform::sweep_token::{Self, SWEEP_TOKEN};

    // ===== Errors =====
    const ENotAuthorized: u64 = 0;
    const ESweepstakesNotActive: u64 = 1;
    const ESweepstakesEnded: u64 = 2;
    const EAlreadyEntered: u64 = 3;
    const EInsufficientCollateral: u64 = 4;
    const EWinnerAlreadySelected: u64 = 5;
    const EDisputeAlreadyExists: u64 = 6;
    const EInvalidProof: u64 = 7;
    const ESweepstakesNotEnded: u64 = 8;
    const ENoWinnerSelected: u64 = 9;

    // ===== Constants =====
    const MINIMUM_COLLATERAL_MULTIPLIER: u64 = 2; // 2x prize value
    const DISPUTE_PERIOD_MS: u64 = 604800000; // 7 days in milliseconds
    const SYBIL_PROTECTION_DELAY_MS: u64 = 86400000; // 24 hours between entries per address

    // ===== Structs =====

    /// Entry NFT - represents the right to enter a specific sweepstakes
    struct EntryNFT has key, store {
        id: UID,
        sweepstakes_id: ID,
        entry_number: u64, // Unique number for this entry
        metadata: String, // Can include custom branding, messages, etc.
    }

    /// Main sweepstakes object
    struct Sweepstakes has key {
        id: UID,
        host: address,
        title: String,
        description: String,
        prize_description: String,
        prize_value_usd: u64, // In cents (e.g., 10000 = $100)
        collateral_deposit_id: ID, // Reference to CollateralDeposit
        start_time: u64,
        end_time: u64,
        max_participants: u64,
        participants: vector<address>,
        winner: Option<address>,
        winner_selected_time: Option<u64>,
        status: u8, // 0=Active, 1=Ended, 2=Disputed, 3=Resolved
        proof_of_delivery: Option<String>, // IPFS hash or URL
        dispute_id: Option<ID>,
        sybil_protection_enabled: bool,
        last_entry_times: Table<address, u64>, // Track last entry time per address
        total_entries_minted: u64, // Track how many NFTs were minted
        entries_used: u64, // Track how many NFTs have been redeemed
    }

    /// Participant entry record
    struct ParticipantEntry has key, store {
        id: UID,
        sweepstakes_id: ID,
        participant: address,
        entry_time: u64,
        entry_hash: vector<u8>, // For randomness
    }

    /// Global sweepstakes registry
    struct SweepstakesRegistry has key {
        id: UID,
        all_sweepstakes: vector<ID>,
        active_sweepstakes: vector<ID>,
        host_sweepstakes: Table<address, vector<ID>>,
        participant_entries: Table<address, vector<ID>>,
        total_sweepstakes: u64,
        total_participants: u64,
    }

    /// Dispute record
    struct Dispute has key {
        id: UID,
        sweepstakes_id: ID,
        winner: address,
        host: address,
        dispute_reason: String,
        created_time: u64,
        proof_submitted: bool,
        proof_content: Option<String>,
        governance_vote_id: Option<ID>,
        status: u8, // 0=Open, 1=Proof_Submitted, 2=Voting, 3=Resolved
    }

    // ===== Events =====

    struct SweepstakesCreated has copy, drop {
        sweepstakes_id: ID,
        host: address,
        title: String,
        prize_value_usd: u64,
        end_time: u64,
        max_participants: u64,
    }

    struct ParticipantEntered has copy, drop {
        sweepstakes_id: ID,
        participant: address,
        entry_time: u64,
        total_participants: u64,
    }

    struct WinnerSelected has copy, drop {
        sweepstakes_id: ID,
        winner: address,
        selection_time: u64,
        total_participants: u64,
    }

    struct DisputeCreated has copy, drop {
        dispute_id: ID,
        sweepstakes_id: ID,
        winner: address,
        host: address,
        dispute_reason: String,
    }

    struct ProofSubmitted has copy, drop {
        dispute_id: ID,
        sweepstakes_id: ID,
        host: address,
        proof_content: String,
    }

    struct SweepstakesResolved has copy, drop {
        sweepstakes_id: ID,
        winner: address,
        resolution: String, // "delivered" or "disputed"
    }

    struct EntryNFTsMinted has copy, drop {
        sweepstakes_id: ID,
        host: address,
        quantity: u64,
        timestamp: u64,
    }

    struct EntryNFTUsed has copy, drop {
        sweepstakes_id: ID,
        entry_nft_id: ID,
        participant: address,
        entry_number: u64,
        timestamp: u64,
    }

    // ===== Init Function =====

    fun init(ctx: &mut TxContext) {
        let registry = SweepstakesRegistry {
            id: object::new(ctx),
            all_sweepstakes: vector::empty(),
            active_sweepstakes: vector::empty(),
            host_sweepstakes: table::new(ctx),
            participant_entries: table::new(ctx),
            total_sweepstakes: 0,
            total_participants: 0,
        };

        transfer::share_object(registry);
    }

    // ===== Public Functions =====

    /// Create a new sweepstakes and mint entry NFTs for the host
    public entry fun create_sweepstakes(
        registry: &mut SweepstakesRegistry,
        collateral_deposit_id: ID,
        title: vector<u8>,
        description: vector<u8>,
        prize_description: vector<u8>,
        prize_value_usd: u64,
        duration_ms: u64,
        max_participants: u64,
        enable_sybil_protection: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let host = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        let end_time = current_time + duration_ms;

        // Create sweepstakes object
        let sweepstakes = Sweepstakes {
            id: object::new(ctx),
            host,
            title: string::utf8(title),
            description: string::utf8(description),
            prize_description: string::utf8(prize_description),
            prize_value_usd,
            collateral_deposit_id,
            start_time: current_time,
            end_time,
            max_participants,
            participants: vector::empty(),
            winner: option::none(),
            winner_selected_time: option::none(),
            status: 0, // Active
            proof_of_delivery: option::none(),
            dispute_id: option::none(),
            sybil_protection_enabled: enable_sybil_protection,
            last_entry_times: table::new(ctx),
            total_entries_minted: max_participants,
            entries_used: 0,
        };

        let sweepstakes_id = object::id(&sweepstakes);

        // Mint Entry NFTs for the host
        let i = 0;
        while (i < max_participants) {
            let entry_nft = EntryNFT {
                id: object::new(ctx),
                sweepstakes_id,
                entry_number: i + 1,
                metadata: string::utf8(b""), // Host can customize this later
            };

            // Transfer NFT to host - they control distribution
            transfer::transfer(entry_nft, host);
            i = i + 1;
        };

        // Update registry
        vector::push_back(&mut registry.all_sweepstakes, sweepstakes_id);
        vector::push_back(&mut registry.active_sweepstakes, sweepstakes_id);

        if (!table::contains(&registry.host_sweepstakes, host)) {
            table::add(&mut registry.host_sweepstakes, host, vector::empty());
        };
        let host_sweepstakes = table::borrow_mut(&mut registry.host_sweepstakes, host);
        vector::push_back(host_sweepstakes, sweepstakes_id);

        registry.total_sweepstakes = registry.total_sweepstakes + 1;

        event::emit(SweepstakesCreated {
            sweepstakes_id,
            host,
            title: string::utf8(title),
            prize_value_usd,
            end_time,
            max_participants,
        });

        event::emit(EntryNFTsMinted {
            sweepstakes_id,
            host,
            quantity: max_participants,
            timestamp: current_time,
        });

        transfer::share_object(sweepstakes);
    }

    /// Enter a sweepstakes using an Entry NFT
    public entry fun enter_sweepstakes_with_nft(
        registry: &mut SweepstakesRegistry,
        sweepstakes: &mut Sweepstakes,
        entry_nft: EntryNFT,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let participant = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Verify the NFT is for this sweepstakes
        assert!(entry_nft.sweepstakes_id == object::id(sweepstakes), ENotAuthorized);

        // Verify sweepstakes is active
        assert!(sweepstakes.status == 0, ESweepstakesNotActive);
        assert!(current_time >= sweepstakes.start_time, ESweepstakesNotActive);
        assert!(current_time < sweepstakes.end_time, ESweepstakesEnded);
        assert!(sweepstakes.entries_used < sweepstakes.max_participants, ESweepstakesEnded);

        // Check if already entered
        assert!(!vector::contains(&sweepstakes.participants, &participant), EAlreadyEntered);

        // Add participant
        vector::push_back(&mut sweepstakes.participants, participant);
        sweepstakes.entries_used = sweepstakes.entries_used + 1;

        // Update registry
        if (!table::contains(&registry.participant_entries, participant)) {
            table::add(&mut registry.participant_entries, participant, vector::empty());
        };
        let participant_entries = table::borrow_mut(&mut registry.participant_entries, participant);
        vector::push_back(participant_entries, object::id(sweepstakes));

        registry.total_participants = registry.total_participants + 1;

        let entry_nft_id = object::id(&entry_nft);
        let entry_number = entry_nft.entry_number;

        event::emit(EntryNFTUsed {
            sweepstakes_id: object::id(sweepstakes),
            entry_nft_id,
            participant,
            entry_number,
            timestamp: current_time,
        });

        event::emit(ParticipantEntered {
            sweepstakes_id: object::id(sweepstakes),
            participant,
            entry_time: current_time,
            total_participants: vector::length(&sweepstakes.participants),
        });

        // Burn the NFT - it's been used
        let EntryNFT { id, sweepstakes_id: _, entry_number: _, metadata: _ } = entry_nft;
        object::delete(id);
    }

    /// Allow host to customize Entry NFT metadata (before distribution)
    public entry fun customize_entry_nft(
        entry_nft: &mut EntryNFT,
        new_metadata: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Only the current owner can customize
        entry_nft.metadata = string::utf8(new_metadata);
    }

    /// Select winner using blockchain randomness
    public entry fun select_winner(
        registry: &mut SweepstakesRegistry,
        sweepstakes: &mut Sweepstakes,
        random: &Random,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);

        // Verify sweepstakes has ended
        assert!(current_time >= sweepstakes.end_time, ESweepstakesNotEnded);
        assert!(sweepstakes.status == 0, ESweepstakesNotActive);
        assert!(option::is_none(&sweepstakes.winner), EWinnerAlreadySelected);

        let participant_count = vector::length(&sweepstakes.participants);
        assert!(participant_count > 0, ENoWinnerSelected);

        // Generate random number and select winner
        let mut random_gen = random::new_generator(random, ctx);
        let winner_index = random::generate_u64_in_range(&mut random_gen, 0, participant_count);
        let winner = *vector::borrow(&sweepstakes.participants, winner_index);

        // Update sweepstakes
        sweepstakes.winner = option::some(winner);
        sweepstakes.winner_selected_time = option::some(current_time);
        sweepstakes.status = 1; // Ended

        // Remove from active sweepstakes
        let sweepstakes_id = object::id(sweepstakes);
        let (found, index) = vector::index_of(&registry.active_sweepstakes, &sweepstakes_id);
        if (found) {
            vector::remove(&mut registry.active_sweepstakes, index);
        };

        event::emit(WinnerSelected {
            sweepstakes_id,
            winner,
            selection_time: current_time,
            total_participants: participant_count,
        });
    }

    /// Submit proof of prize delivery (host only)
    public entry fun submit_proof_of_delivery(
        sweepstakes: &mut Sweepstakes,
        proof_content: vector<u8>, // IPFS hash or URL
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == sweepstakes.host, ENotAuthorized);
        assert!(sweepstakes.status == 1, ESweepstakesNotActive); // Must be ended
        assert!(option::is_some(&sweepstakes.winner), ENoWinnerSelected);

        sweepstakes.proof_of_delivery = option::some(string::utf8(proof_content));
        sweepstakes.status = 3; // Resolved

        event::emit(SweepstakesResolved {
            sweepstakes_id: object::id(sweepstakes),
            winner: *option::borrow(&sweepstakes.winner),
            resolution: string::utf8(b"delivered"),
        });
    }

    /// Create dispute (winner only)
    public entry fun create_dispute(
        sweepstakes: &mut Sweepstakes,
        reason: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        let disputer = tx_context::sender(ctx);

        // Verify disputer is the winner
        assert!(option::is_some(&sweepstakes.winner), ENoWinnerSelected);
        assert!(disputer == *option::borrow(&sweepstakes.winner), ENotAuthorized);

        // Check if dispute period is still valid
        assert!(option::is_some(&sweepstakes.winner_selected_time), ENoWinnerSelected);
        let winner_time = *option::borrow(&sweepstakes.winner_selected_time);
        assert!(current_time - winner_time <= DISPUTE_PERIOD_MS, ESweepstakesNotEnded);

        // Check if dispute already exists
        assert!(option::is_none(&sweepstakes.dispute_id), EDisputeAlreadyExists);

        // Create dispute
        let dispute = Dispute {
            id: object::new(ctx),
            sweepstakes_id: object::id(sweepstakes),
            winner: disputer,
            host: sweepstakes.host,
            dispute_reason: string::utf8(reason),
            created_time: current_time,
            proof_submitted: false,
            proof_content: option::none(),
            governance_vote_id: option::none(),
            status: 0, // Open
        };

        let dispute_id = object::id(&dispute);
        sweepstakes.dispute_id = option::some(dispute_id);
        sweepstakes.status = 2; // Disputed

        event::emit(DisputeCreated {
            dispute_id,
            sweepstakes_id: object::id(sweepstakes),
            winner: disputer,
            host: sweepstakes.host,
            dispute_reason: string::utf8(reason),
        });

        transfer::share_object(dispute);
    }

    /// Submit proof to counter dispute (host only)
    public entry fun submit_dispute_proof(
        dispute: &mut Dispute,
        proof_content: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == dispute.host, ENotAuthorized);
        assert!(dispute.status == 0, EInvalidProof); // Must be open

        dispute.proof_content = option::some(string::utf8(proof_content));
        dispute.proof_submitted = true;
        dispute.status = 1; // Proof submitted

        event::emit(ProofSubmitted {
            dispute_id: object::id(dispute),
            sweepstakes_id: dispute.sweepstakes_id,
            host: dispute.host,
            proof_content: string::utf8(proof_content),
        });
    }

    // ===== View Functions =====

    /// Get sweepstakes details
    public fun get_sweepstakes_info(sweepstakes: &Sweepstakes): (
        address, // host
        String, // title
        String, // description
        String, // prize_description
        u64, // prize_value_usd
        u64, // start_time
        u64, // end_time
        u64, // max_participants
        u64, // current_participants
        Option<address>, // winner
        u8, // status
        bool // sybil_protection_enabled
    ) {
        (
            sweepstakes.host,
            sweepstakes.title,
            sweepstakes.description,
            sweepstakes.prize_description,
            sweepstakes.prize_value_usd,
            sweepstakes.start_time,
            sweepstakes.end_time,
            sweepstakes.max_participants,
            vector::length(&sweepstakes.participants),
            sweepstakes.winner,
            sweepstakes.status,
            sweepstakes.sybil_protection_enabled
        )
    }

    /// Get dispute details
    public fun get_dispute_info(dispute: &Dispute): (
        ID, // sweepstakes_id
        address, // winner
        address, // host
        String, // dispute_reason
        u64, // created_time
        bool, // proof_submitted
        Option<String>, // proof_content
        u8 // status
    ) {
        (
            dispute.sweepstakes_id,
            dispute.winner,
            dispute.host,
            dispute.dispute_reason,
            dispute.created_time,
            dispute.proof_submitted,
            dispute.proof_content,
            dispute.status
        )
    }

    /// Get registry statistics
    public fun get_registry_stats(registry: &SweepstakesRegistry): (u64, u64, u64) {
        (
            registry.total_sweepstakes,
            vector::length(&registry.active_sweepstakes),
            registry.total_participants
        )
    }

    /// Check if user has entered sweepstakes
    public fun has_entered_sweepstakes(sweepstakes: &Sweepstakes, participant: address): bool {
        vector::contains(&sweepstakes.participants, &participant)
    }

    /// Get user's sweepstakes (as host)
    public fun get_host_sweepstakes(registry: &SweepstakesRegistry, host: address): vector<ID> {
        if (table::contains(&registry.host_sweepstakes, host)) {
            *table::borrow(&registry.host_sweepstakes, host)
        } else {
            vector::empty()
        }
    }

    /// Get user's entries (as participant)
    public fun get_participant_entries(registry: &SweepstakesRegistry, participant: address): vector<ID> {
        if (table::contains(&registry.participant_entries, participant)) {
            *table::borrow(&registry.participant_entries, participant)
        } else {
            vector::empty()
        }
    }
}
