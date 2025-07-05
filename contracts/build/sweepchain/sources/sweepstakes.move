module sweepchain::sweepstakes {
    use std::string::{Self, String};
    use std::vector;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::random::{Self, Random};
    use sui::address;
    use sweepchain::sweep_token::SWEEP_TOKEN;

    // ===== Error Codes =====
    const ESweepstakesNotActive: u64 = 0;
    const ESweepstakesEnded: u64 = 1;
    const EInsufficientFee: u64 = 2;
    const EAlreadyEntered: u64 = 3;
    const ENotHost: u64 = 4;
    const EWinnersAlreadySelected: u64 = 5;
    const ENoEntries: u64 = 6;

    // ===== Structs =====

    /// Entry NFT - represents a participant's entry in a sweepstakes
    public struct EntryNFT has key, store {
        id: UID,
        sweepstakes_id: address,
        entry_number: u64,
        participant: address,
        participant_email_hash: String, // Hash of email for privacy
        timestamp: u64,
        bonus_entries: u64,
    }

    /// Main sweepstakes object
    public struct Sweepstakes has key {
        id: UID,
        title: String,
        description: String,
        prize_description: String,
        prize_value: u64,
        host: address,
        start_time: u64,
        end_time: u64,
        entry_fee_usd: u64, // Fee in USD cents (e.g., 29900 = $299)
        max_entries: u64,
        winners_count: u64,
        // Entry tracking
        entries: vector<address>, // Entry NFT addresses
        participant_entries: vector<address>, // Participant addresses
        total_entries: u64,
        // Status
        is_active: bool,
        winners_selected: bool,
        selected_winners: vector<address>,
        // Verification
        winner_selection_tx: String,
        random_seed: String,
        // Treasury
        collected_fees: Balance<SWEEP_TOKEN>,
    }

    /// Platform configuration
    public struct PlatformConfig has key {
        id: UID,
        admin: address,
        treasury_wallet: address,
        platform_fee_percentage: u64, // Basis points (e.g., 500 = 5%)
        sweep_buyback_percentage: u64, // Basis points (e.g., 5000 = 50%)
    }

    /// Capability for platform admin
    public struct AdminCap has key {
        id: UID,
    }

    // ===== Events =====

    public struct SweepstakesCreated has copy, drop {
        sweepstakes_id: address,
        host: address,
        title: String,
        prize_value: u64,
        end_time: u64,
    }

    public struct EntryCreated has copy, drop {
        sweepstakes_id: address,
        entry_id: address,
        participant: address,
        entry_number: u64,
        timestamp: u64,
    }

    public struct WinnersSelected has copy, drop {
        sweepstakes_id: address,
        winners: vector<address>,
        random_seed: String,
        selection_tx: String,
    }

    // ===== Functions =====

    /// Initialize the platform
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        let config = PlatformConfig {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            treasury_wallet: tx_context::sender(ctx),
            platform_fee_percentage: 500, // 5%
            sweep_buyback_percentage: 5000, // 50%
        };

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(config);
    }

    /// Create a new sweepstakes campaign
    public fun create_sweepstakes(
        title: String,
        description: String,
        prize_description: String,
        prize_value: u64,
        end_time: u64,
        entry_fee_usd: u64,
        max_entries: u64,
        winners_count: u64,
        fee_payment: Coin<SWEEP_TOKEN>,
        config: &PlatformConfig,
        clock: &Clock,
        ctx: &mut TxContext
    ): address {
        // Validate fee payment
        let fee_amount = coin::value(&fee_payment);
        assert!(fee_amount >= entry_fee_usd, EInsufficientFee);

        let current_time = clock::timestamp_ms(clock);
        assert!(end_time > current_time, ESweepstakesEnded);

        let sweepstakes = Sweepstakes {
            id: object::new(ctx),
            title,
            description,
            prize_description,
            prize_value,
            host: tx_context::sender(ctx),
            start_time: current_time,
            end_time,
            entry_fee_usd,
            max_entries,
            winners_count,
            entries: vector::empty(),
            participant_entries: vector::empty(),
            total_entries: 0,
            is_active: true,
            winners_selected: false,
            selected_winners: vector::empty(),
            winner_selection_tx: string::utf8(b""),
            random_seed: string::utf8(b""),
            collected_fees: coin::into_balance(fee_payment),
        };

        let sweepstakes_id = object::uid_to_address(&sweepstakes.id);

        event::emit(SweepstakesCreated {
            sweepstakes_id,
            host: tx_context::sender(ctx),
            title,
            prize_value,
            end_time,
        });

        transfer::share_object(sweepstakes);
        sweepstakes_id
    }

    /// Enter a sweepstakes - creates Entry NFT
    public fun enter_sweepstakes(
        sweepstakes: &mut Sweepstakes,
        participant_email_hash: String,
        clock: &Clock,
        ctx: &mut TxContext
    ): address {
        let current_time = clock::timestamp_ms(clock);
        let participant = tx_context::sender(ctx);

        // Validate sweepstakes is active
        assert!(sweepstakes.is_active, ESweepstakesNotActive);
        assert!(current_time < sweepstakes.end_time, ESweepstakesEnded);
        assert!(sweepstakes.total_entries < sweepstakes.max_entries, EInsufficientFee);

        // Check if participant already entered
        let mut i = 0;
        while (i < vector::length(&sweepstakes.participant_entries)) {
            let existing_participant = vector::borrow(&sweepstakes.participant_entries, i);
            assert!(*existing_participant != participant, EAlreadyEntered);
            i = i + 1;
        };

        // Create Entry NFT
        let entry_number = sweepstakes.total_entries + 1;
        let entry_nft = EntryNFT {
            id: object::new(ctx),
            sweepstakes_id: object::uid_to_address(&sweepstakes.id),
            entry_number,
            participant,
            participant_email_hash,
            timestamp: current_time,
            bonus_entries: 0,
        };

        let entry_id = object::uid_to_address(&entry_nft.id);

        // Update sweepstakes
        vector::push_back(&mut sweepstakes.entries, entry_id);
        vector::push_back(&mut sweepstakes.participant_entries, participant);
        sweepstakes.total_entries = sweepstakes.total_entries + 1;

        event::emit(EntryCreated {
            sweepstakes_id: object::uid_to_address(&sweepstakes.id),
            entry_id,
            participant,
            entry_number,
            timestamp: current_time,
        });

        // Transfer Entry NFT to participant
        transfer::transfer(entry_nft, participant);
        entry_id
    }

    /// Select winners using provably fair randomness
    public fun select_winners(
        sweepstakes: &mut Sweepstakes,
        random: &Random,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= sweepstakes.end_time, ESweepstakesNotActive);
        assert!(tx_context::sender(ctx) == sweepstakes.host, ENotHost);
        assert!(!sweepstakes.winners_selected, EWinnersAlreadySelected);
        assert!(sweepstakes.total_entries > 0, ENoEntries);

        // Generate random seed
        let mut random_generator = random::new_generator(random, ctx);
        let random_bytes = random::generate_bytes(&mut random_generator, 32);
        let random_seed = string::utf8(random_bytes);

        // Select winners
        let mut selected_winners = vector::empty<address>();
        let mut i = 0;
        while (i < sweepstakes.winners_count && i < sweepstakes.total_entries) {
            let random_index = random::generate_u64_in_range(
                &mut random_generator,
                0,
                sweepstakes.total_entries - 1
            );
            let winner_participant = *vector::borrow(&sweepstakes.participant_entries, random_index);

            // Avoid duplicate winners
            if (!vector::contains(&selected_winners, &winner_participant)) {
                vector::push_back(&mut selected_winners, winner_participant);
                i = i + 1;
            };
        };

        // Update sweepstakes
        sweepstakes.selected_winners = selected_winners;
        sweepstakes.winners_selected = true;
        sweepstakes.random_seed = random_seed;
        sweepstakes.winner_selection_tx = string::utf8(b""); // Will be set by frontend

        event::emit(WinnersSelected {
            sweepstakes_id: object::uid_to_address(&sweepstakes.id),
            winners: selected_winners,
            random_seed,
            selection_tx: string::utf8(b""),
        });
    }

    /// Add bonus entries for social sharing
    public fun add_bonus_entries(
        entry_nft: &mut EntryNFT,
        bonus_count: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == entry_nft.participant, ENotHost);
        entry_nft.bonus_entries = entry_nft.bonus_entries + bonus_count;
    }

    // ===== View Functions =====

    public fun get_sweepstakes_info(sweepstakes: &Sweepstakes): (
        String, String, String, u64, address, u64, u64, u64, u64, u64, bool, bool
    ) {
        (
            sweepstakes.title,
            sweepstakes.description,
            sweepstakes.prize_description,
            sweepstakes.prize_value,
            sweepstakes.host,
            sweepstakes.start_time,
            sweepstakes.end_time,
            sweepstakes.entry_fee_usd,
            sweepstakes.total_entries,
            sweepstakes.winners_count,
            sweepstakes.is_active,
            sweepstakes.winners_selected
        )
    }

    public fun get_entry_info(entry_nft: &EntryNFT): (
        address, u64, address, String, u64, u64
    ) {
        (
            entry_nft.sweepstakes_id,
            entry_nft.entry_number,
            entry_nft.participant,
            entry_nft.participant_email_hash,
            entry_nft.timestamp,
            entry_nft.bonus_entries
        )
    }

    public fun get_winners(sweepstakes: &Sweepstakes): vector<address> {
        sweepstakes.selected_winners
    }

    public fun get_verification_data(sweepstakes: &Sweepstakes): (
        vector<address>, String, String, bool
    ) {
        (
            sweepstakes.entries,
            sweepstakes.random_seed,
            sweepstakes.winner_selection_tx,
            sweepstakes.winners_selected
        )
    }
}
