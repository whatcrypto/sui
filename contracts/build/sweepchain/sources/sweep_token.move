// SWEEP Token Contract - Platform token with buyback mechanics
module sweepchain::sweep_token {
    // Core Sui imports
    use sui::object::UID;
    use sui::tx_context::TxContext;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance, Supply};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::url::{Self, Url};

    // Standard library imports
    use std::option;

    // ===== Error Codes =====
    const EInsufficientBalance: u64 = 0;
    const ENotAuthorized: u64 = 1;
    const EInvalidAmount: u64 = 2;

    // ===== Constants =====
    const TOTAL_SUPPLY: u64 = 1_000_000_000_000_000; // 1B SWEEP with 6 decimals
    const DECIMALS: u8 = 6;

    // ===== Structs =====

    /// One-time witness for SWEEP token
    public struct SWEEP_TOKEN has drop {}

    /// Platform treasury for managing buybacks and fees
    public struct PlatformTreasury has key {
        id: UID,
        sweep_balance: Balance<SWEEP_TOKEN>,
        total_revenue_usd: u64, // Track total USD revenue
        total_buybacks: u64,    // Track total SWEEP bought back
        total_burned: u64,      // Track total SWEEP burned
        buyback_percentage: u64, // Percentage of revenue for buybacks (basis points)
    }

    /// Admin capability for treasury management
    public struct TreasuryAdminCap has key {
        id: UID,
    }

    // ===== Events =====

    public struct TokensIssued has copy, drop {
        amount: u64,
        recipient: address,
    }

    public struct BuybackExecuted has copy, drop {
        usd_amount: u64,
        sweep_amount: u64,
        new_total_buybacks: u64,
    }

    public struct TokensBurned has copy, drop {
        amount: u64,
        new_total_burned: u64,
    }

    public struct RevenueRecorded has copy, drop {
        usd_amount: u64,
        new_total_revenue: u64,
    }

    // ===== Functions =====

    /// Initialize the SWEEP token
    fun init(witness: SWEEP_TOKEN, ctx: &mut TxContext) {
        // Create the coin
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            DECIMALS,
            b"SWEEP",
            b"SweepChain Token",
            b"The native token of SweepChain - a provably fair sweepstakes platform",
            option::some(url::new_unsafe_from_bytes(b"https://sweepchain.com/token-icon.png")),
            ctx
        );

        // Create platform treasury
        let treasury = PlatformTreasury {
            id: object::new(ctx),
            sweep_balance: balance::zero(),
            total_revenue_usd: 0,
            total_buybacks: 0,
            total_burned: 0,
            buyback_percentage: 5000, // 50% of revenue goes to buybacks
        };

        // Create admin capability
        let admin_cap = TreasuryAdminCap {
            id: object::new(ctx),
        };

        // Transfer objects
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(treasury);
    }

    /// Mint SWEEP tokens (only treasury cap holder)
    public fun mint(
        treasury_cap: &mut TreasuryCap<SWEEP_TOKEN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coins = coin::mint(treasury_cap, amount, ctx);

        event::emit(TokensIssued {
            amount,
            recipient,
        });

        transfer::public_transfer(coins, recipient);
    }

    /// Record platform revenue (triggers buyback)
    public fun record_revenue(
        treasury: &mut PlatformTreasury,
        usd_amount: u64,
        _admin_cap: &TreasuryAdminCap,
        _ctx: &mut TxContext
    ) {
        treasury.total_revenue_usd = treasury.total_revenue_usd + usd_amount;

        event::emit(RevenueRecorded {
            usd_amount,
            new_total_revenue: treasury.total_revenue_usd,
        });
    }

    /// Execute buyback (simulated - in reality would use DEX)
    public fun execute_buyback(
        treasury: &mut PlatformTreasury,
        usd_amount: u64,
        sweep_purchased: Coin<SWEEP_TOKEN>,
        _admin_cap: &TreasuryAdminCap,
        _ctx: &mut TxContext
    ) {
        let sweep_amount = coin::value(&sweep_purchased);
        let sweep_balance = coin::into_balance(sweep_purchased);

        balance::join(&mut treasury.sweep_balance, sweep_balance);
        treasury.total_buybacks = treasury.total_buybacks + sweep_amount;

        event::emit(BuybackExecuted {
            usd_amount,
            sweep_amount,
            new_total_buybacks: treasury.total_buybacks,
        });
    }

    /// Burn SWEEP tokens from treasury
    public fun burn_from_treasury(
        treasury: &mut PlatformTreasury,
        treasury_cap: &mut TreasuryCap<SWEEP_TOKEN>,
        amount: u64,
        _admin_cap: &TreasuryAdminCap,
        ctx: &mut TxContext
    ) {
        assert!(balance::value(&treasury.sweep_balance) >= amount, EInsufficientBalance);

        let to_burn = balance::split(&mut treasury.sweep_balance, amount);
        let burn_coin = coin::from_balance(to_burn, ctx);
        coin::burn(treasury_cap, burn_coin);

        treasury.total_burned = treasury.total_burned + amount;

        event::emit(TokensBurned {
            amount,
            new_total_burned: treasury.total_burned,
        });
    }

    /// Update buyback percentage
    public fun update_buyback_percentage(
        treasury: &mut PlatformTreasury,
        new_percentage: u64,
        _admin_cap: &TreasuryAdminCap,
        _ctx: &mut TxContext
    ) {
        treasury.buyback_percentage = new_percentage;
    }

    // ===== View Functions =====

    public fun get_treasury_info(treasury: &PlatformTreasury): (u64, u64, u64, u64, u64) {
        (
            balance::value(&treasury.sweep_balance),
            treasury.total_revenue_usd,
            treasury.total_buybacks,
            treasury.total_burned,
            treasury.buyback_percentage
        )
    }

    public fun get_total_supply(): u64 {
        TOTAL_SUPPLY
    }

    public fun get_decimals(): u8 {
        DECIMALS
    }
}
