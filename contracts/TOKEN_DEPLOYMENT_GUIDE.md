# SWEEP Token Deployment Guide

## Overview

The SWEEP token is the foundation of the SweepChain platform. It enables:
- **Collateral deposits** for sweepstakes hosts
- **Staking rewards** for platform participants
- **Governance voting** for dispute resolution
- **Platform fees** paid in SWEEP tokens

## Current Token Design

### Tokenomics
- **Total Supply**: 1 billion SWEEP tokens
- **Decimals**: 6 (1 SWEEP = 1,000,000 units)
- **Initial Allocation**:
  - Team: 15% (150M SWEEP)
  - Treasury: 20% (200M SWEEP)
  - Community: 30% (300M SWEEP)
  - Ecosystem: 20% (200M SWEEP)
  - Public Sale: 10% (100M SWEEP)
  - Private Sale: 5% (50M SWEEP)

### Key Features
- **Phased minting** with allocation tracking
- **Collateral system** for sweepstakes hosts
- **Staking with rewards** and lock periods
- **Governance voting** rights
- **Platform fee collection**

## Deployment Steps

### 1. Deploy Smart Contracts

```bash
# Build contracts
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000 --network testnet
```

### 2. Get Object IDs

After deployment, note these object IDs:
- **Package ID**: The deployed package
- **PlatformTreasury**: Treasury object for minting
- **StakingRegistry**: Registry for staking positions

### 3. Mint Initial Tokens

```typescript
// Example minting transaction
const tx = new TransactionBlock();

// Mint team allocation (150M SWEEP)
tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::mint_tokens_with_allocation`,
    arguments: [
        tx.object(TREASURY_OBJECT_ID),
        tx.pure(150000000 * 1000000), // 150M SWEEP
        tx.pure(TEAM_WALLET_ADDRESS),
        tx.pure(0), // Team allocation type
    ]
});

// Repeat for other allocations...
```

### 4. Test Collateral System

```typescript
// Deposit collateral for a sweepstakes
const collateralAmount = 1000 * 1000000; // 1000 SWEEP

tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::deposit_collateral`,
    arguments: [
        tx.object(TREASURY_OBJECT_ID),
        tx.pure(sweepstakesId),
        tx.splitCoins(tx.gas, [tx.pure(collateralAmount)]),
    ]
});
```

### 5. Test Staking System

```typescript
// Stake tokens for rewards
const stakeAmount = 500 * 1000000; // 500 SWEEP
const lockPeriod = 2592000000; // 30 days

tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::stake_tokens`,
    arguments: [
        tx.object(STAKING_REGISTRY_ID),
        tx.splitCoins(tx.gas, [tx.pure(stakeAmount)]),
        tx.pure(lockPeriod),
    ]
});
```

## Collateral System Flow

### For Sweepstakes Hosts

1. **Deposit Collateral**: Host deposits SWEEP tokens as collateral
2. **Create Sweepstakes**: Use collateral deposit ID to create sweepstakes
3. **Run Sweepstakes**: Participants enter for free
4. **Deliver Prize**: Host delivers prize to winner
5. **Release Collateral**: Platform releases collateral back to host

### Collateral Requirements

- **Minimum**: 2x prize value in SWEEP tokens
- **Locked**: During entire sweepstakes duration
- **Released**: After successful prize delivery
- **Forfeited**: If host fails to deliver (goes to winner)

## Staking Rewards

### Lock Periods & Multipliers

- **1 day**: 1.0x multiplier
- **7 days**: 1.1x multiplier
- **30 days**: 1.25x multiplier
- **90 days**: 1.5x multiplier

### Minimum Requirements

- **Minimum stake**: 100 SWEEP tokens
- **Voting rights**: 1000 SWEEP staked
- **Rewards**: Based on lock period and amount

## Governance System

### Voting Rights

- **Minimum stake**: 1000 SWEEP tokens
- **Voting power**: Based on staked amount
- **Dispute resolution**: Community votes on disputes

### Dispute Flow

1. **Winner disputes** delivery
2. **Host uploads** proof of delivery
3. **$SWEEP holders vote** on resolution
4. **Resolution executed** based on vote

## Platform Fees

### Fee Structure

- **Sweepstakes creation**: Paid in SWEEP tokens
- **Platform services**: Analytics, targeting, etc.
- **Premium features**: Advanced host tools

### Fee Collection

```typescript
// Collect platform fees
tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::collect_fees`,
    arguments: [
        tx.object(TREASURY_OBJECT_ID),
        tx.splitCoins(tx.gas, [tx.pure(feeAmount)]),
    ]
});
```

## Security Features

### Sybil Attack Prevention

- **One entry per address** per sweepstakes
- **Time delays** between entries
- **Transaction history** analysis
- **Captcha/proof-of-humanity** integration

### Collateral Protection

- **Smart contract enforcement** of collateral requirements
- **Automatic release** after successful delivery
- **Dispute resolution** for failed deliveries
- **Transparent tracking** of all deposits

## Next Steps

### Immediate Actions

1. **Deploy contracts** to testnet
2. **Mint initial tokens** with proper allocation
3. **Test collateral system** with sample sweepstakes
4. **Verify staking functionality** with test stakes
5. **Test governance voting** with sample disputes

### Future Enhancements

1. **Vesting contracts** for team/advisors
2. **Liquidity mining** programs
3. **Advanced staking** with tiered rewards
4. **Cross-chain bridges** for token portability
5. **DAO governance** with proposal system

## Troubleshooting

### Common Issues

1. **Insufficient gas**: Increase gas budget for complex transactions
2. **Object not found**: Verify object IDs are correct
3. **Permission denied**: Ensure you're the treasury admin
4. **Invalid amounts**: Check decimal precision (6 decimals)

### Testing Checklist

- [ ] Contracts deploy successfully
- [ ] Initial tokens mint correctly
- [ ] Collateral deposits work
- [ ] Staking positions create properly
- [ ] Governance voting functions
- [ ] Platform fees collect correctly

## Conclusion

The SWEEP token system provides the economic foundation for the entire SweepChain platform. With proper deployment and testing, the collateral and staking systems will enable:

- **Trustless sweepstakes** with guaranteed payouts
- **Incentivized participation** through staking rewards
- **Community governance** for dispute resolution
- **Sustainable platform** with fee-based revenue

The key is getting the initial token distribution right and ensuring the collateral system is operational before launching sweepstakes.
