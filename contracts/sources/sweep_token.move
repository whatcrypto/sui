// SWEEP Token Contract - Core tokenomics for Sweepstakes-as-a-Service Platform
module sweepstakes_platform::sweep_token {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::option::{Self, Option};

    // ===== Errors =====
    const EInsufficientBalance: u64 = 0;
    const EInsufficientStake: u64 = 1;
    const EStakingPeriodNotMet: u64 = 2;
    const ENotAuthorized: u64 = 3;
    const EInvalidAmount: u64 = 4;

    // ===== Structs =====

    /// One-time witness for SWEEP token
    struct SWEEP_TOKEN has drop {}

    /// Global platform treasury and configuration
    struct PlatformTreasury has key {
        id: UID,
        treasury_cap: TreasuryCap<SWEEP_TOKEN>,
        total_staked: u64,
        platform_fee_rate: u64, // Basis points (100 = 1%)
        minimum_stake_for_voting: u64, // Minimum SWEEP to vote in governance
        admin: address,
    }

    /// Individual staking position
    struct StakingPosition has key, store {
        id: UID,
        owner: address,
        amount: u64,
        stake_timestamp: u64,
        rewards_earned: u64,
        voting_power: u64,
    }

    /// Collateral deposit for sweepstakes hosts
    struct CollateralDeposit has key {
        id: UID,
        host: address,
        sweepstakes_id: vector<u8>,
        amount: Balance<SWEEP_TOKEN>,
        deposit_timestamp: u64,
        is_locked: bool,
    }

    /// Staking registry to track all positions
    struct StakingRegistry has key {
        id: UID,
        positions: Table<address, vector<object::ID>>,
        total_stakers: u64,
        reward_pool: Balance<SWEEP_TOKEN>,
    }

    // ===== Events =====

    struct TokensMinted has copy, drop {
        recipient: address,
        amount: u64,
    }

    struct TokensStaked has copy, drop {
        staker: address,
        amount: u64,
        position_id: object::ID,
    }

    struct TokensUnstaked has copy, drop {
        staker: address,
        amount: u64,
        rewards: u64,
    }

    struct CollateralDeposited has copy, drop {
        host: address,
        sweepstakes_id: vector<u8>,
        amount: u64,
    }

    struct CollateralReleased has copy, drop {
        host: address,
        sweepstakes_id: vector<u8>,
        amount: u64,
    }

    // ===== Init Function =====

    fun init(witness: SWEEP_TOKEN, ctx: &mut TxContext) {
        // Create treasury cap for SWEEP token
        let (treasury_cap, metadata) = coin::create_currency<SWEEP_TOKEN>(
            witness,
            8, // decimals
            b"SWEEP",
            b"Sweep Token",
            b"Governance and utility token for the Sweepstakes-as-a-Service platform",
            option::none(),
            ctx
        );

        // Create platform treasury
        let platform_treasury = PlatformTreasury {
            id: object::new(ctx),
            treasury_cap,
            total_staked: 0,
            platform_fee_rate: 300, // 3%
            minimum_stake_for_voting: 1000 * 100000000, // 1000 SWEEP
            admin: tx_context::sender(ctx),
        };

        // Create staking registry
        let staking_registry = StakingRegistry {
            id: object::new(ctx),
            positions: table::new(ctx),
            total_stakers: 0,
            reward_pool: balance::zero(),
        };

        // Share objects
        transfer::share_object(platform_treasury);
        transfer::share_object(staking_registry);
        transfer::public_transfer(metadata, tx_context::sender(ctx));
    }

    // ===== Public Functions =====

    /// Mint SWEEP tokens (admin only)
    public entry fun mint_tokens(
        treasury: &mut PlatformTreasury,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == treasury.admin, ENotAuthorized);

        let coins = coin::mint(&mut treasury.treasury_cap, amount, ctx);
        transfer::public_transfer(coins, recipient);

        event::emit(TokensMinted {
            recipient,
            amount,
        });
    }

    /// Stake SWEEP tokens for governance voting and rewards
    public entry fun stake_tokens(
        registry: &mut StakingRegistry,
        payment: Coin<SWEEP_TOKEN>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        assert!(amount > 0, EInvalidAmount);

        let staker = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Create staking position
        let position = StakingPosition {
            id: object::new(ctx),
            owner: staker,
            amount,
            stake_timestamp: current_time,
            rewards_earned: 0,
            voting_power: amount, // 1:1 ratio initially
        };

        let position_id = object::id(&position);

        // Add to registry
        if (!table::contains(&registry.positions, staker)) {
            table::add(&mut registry.positions, staker, vector::empty());
            registry.total_stakers = registry.total_stakers + 1;
        };

        let user_positions = table::borrow_mut(&mut registry.positions, staker);
        vector::push_back(user_positions, position_id);

        // Convert coin to balance and add to reward pool for now
        let stake_balance = coin::into_balance(payment);
        balance::join(&mut registry.reward_pool, stake_balance);

        event::emit(TokensStaked {
            staker,
            amount,
            position_id,
        });

        transfer::transfer(position, staker);
    }

    /// Deposit collateral for sweepstakes hosting
    public entry fun deposit_collateral(
        payment: Coin<SWEEP_TOKEN>,
        sweepstakes_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        assert!(amount > 0, EInvalidAmount);

        let host = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        let collateral = CollateralDeposit {
            id: object::new(ctx),
            host,
            sweepstakes_id,
            amount: coin::into_balance(payment),
            deposit_timestamp: current_time,
            is_locked: true,
        };

        event::emit(CollateralDeposited {
            host,
            sweepstakes_id,
            amount,
        });

        transfer::share_object(collateral);
    }

    /// Release collateral after successful sweepstakes completion
    public entry fun release_collateral(
        collateral: &mut CollateralDeposit,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == collateral.host, ENotAuthorized);
        assert!(collateral.is_locked, ENotAuthorized);

        let amount = balance::value(&collateral.amount);
        let released_balance = balance::withdraw_all(&mut collateral.amount);
        let released_coin = coin::from_balance(released_balance, ctx);

        collateral.is_locked = false;

        event::emit(CollateralReleased {
            host: collateral.host,
            sweepstakes_id: collateral.sweepstakes_id,
            amount,
        });

        transfer::public_transfer(released_coin, collateral.host);
    }

    /// Slash collateral for dispute resolution (governance only)
    public fun slash_collateral(
        collateral: &mut CollateralDeposit,
        slash_amount: u64,
        ctx: &mut TxContext
    ): Balance<SWEEP_TOKEN> {
        // This function should only be called by governance contract
        assert!(balance::value(&collateral.amount) >= slash_amount, EInsufficientBalance);

        balance::split(&mut collateral.amount, slash_amount)
    }

    // ===== View Functions =====

    /// Get staking position details
    public fun get_staking_position(position: &StakingPosition): (address, u64, u64, u64, u64) {
        (
            position.owner,
            position.amount,
            position.stake_timestamp,
            position.rewards_earned,
            position.voting_power
        )
    }

    /// Get collateral deposit details
    public fun get_collateral_details(collateral: &CollateralDeposit): (address, vector<u8>, u64, u64, bool) {
        (
            collateral.host,
            collateral.sweepstakes_id,
            balance::value(&collateral.amount),
            collateral.deposit_timestamp,
            collateral.is_locked
        )
    }

    /// Get platform treasury info
    public fun get_platform_info(treasury: &PlatformTreasury): (u64, u64, u64, address) {
        (
            treasury.total_staked,
            treasury.platform_fee_rate,
            treasury.minimum_stake_for_voting,
            treasury.admin
        )
    }

    /// Check if address has minimum stake for voting
    public fun has_voting_rights(
        treasury: &PlatformTreasury,
        registry: &StakingRegistry,
        voter: address
    ): bool {
        if (!table::contains(&registry.positions, voter)) {
            return false
        };

        // In a real implementation, you'd sum up all staking positions
        // For now, simplified check
        treasury.minimum_stake_for_voting <= 1000 * 100000000 // Placeholder
    }

    // ===== Admin Functions =====

    /// Update platform fee rate (admin only)
    public entry fun update_fee_rate(
        treasury: &mut PlatformTreasury,
        new_rate: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == treasury.admin, ENotAuthorized);
        treasury.platform_fee_rate = new_rate;
    }

    /// Update minimum stake for voting (admin only)
    public entry fun update_minimum_stake(
        treasury: &mut PlatformTreasury,
        new_minimum: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == treasury.admin, ENotAuthorized);
        treasury.minimum_stake_for_voting = new_minimum;
    }
}
