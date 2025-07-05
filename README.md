# Sui Sweepstakes Platform Deployment Guide

This guide will help you deploy the Move smart contracts and configure the frontend properly.

## Prerequisites

1. **Install Sui CLI**: Follow the [official Sui installation guide](https://docs.sui.io/guides/developer/getting-started/sui-install)
2. **Configure Sui Client**: Set up your Sui client with a wallet
3. **Get Testnet SUI**: Request testnet SUI from the [Sui Discord faucet](https://discord.gg/sui)

## Step 1: Setup Sui Client

```bash
# Initialize Sui client (if not already done)
sui client

# Check your address and balance
sui client active-address
sui client gas
```

## Step 2: Deploy the Smart Contracts

Navigate to the contracts directory and deploy:

```bash
# Navigate to contracts directory
cd contracts

# Build the contracts first (optional, to check for errors)
sui move build

# Deploy the contracts to devnet
sui client publish --gas-budget 100000000
```

**Important**: Save the output from this command! You'll need several values from the deployment output.

## Step 3: Extract Deployment Information

From the deployment output, you'll need to extract:

1. **Package ID**: The main package identifier
2. **Object IDs**: Various shared objects created during deployment
   - SWEEP Token Treasury
   - Staking Registry
   - Sweepstakes Registry
   - Governance Registry

Example deployment output:
```
Package published successfully!
Package ID: 0x1234567890abcdef...
Created Objects:
  - Object ID: 0xabcdef1234567890... (SWEEP_TOKEN Treasury)
  - Object ID: 0x9876543210fedcba... (Staking Registry)
  - Object ID: 0x5555666677778888... (Sweepstakes Registry)
  - Object ID: 0x1111222233334444... (Governance Registry)
```

## Step 4: Update Configuration

Update `lib/smart-contract/config.ts` with your deployed contract addresses:

```typescript
export const contractConfig: ContractConfig = {
  PACKAGE_ID: "0x1234567890abcdef...", // Your deployed package ID
  SWEEP_TOKEN: {
    PLATFORM_TREASURY: "0xabcdef1234567890...", // Treasury object ID
    STAKING_REGISTRY: "0x9876543210fedcba...", // Staking registry object ID
    COIN_TYPE: "0x1234567890abcdef...::sweep_token::SWEEP_TOKEN", // Package ID + module + type
  },
  SWEEPSTAKES: {
    REGISTRY: "0x5555666677778888...", // Sweepstakes registry object ID
  },
  GOVERNANCE: {
    REGISTRY: "0x1111222233334444...", // Governance registry object ID
  },
  NETWORK: "devnet", // or "testnet" / "mainnet"
  // ... rest of config
};
```

## Step 5: Test the Deployment

After updating the configuration:

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` and test:
1. Connect your wallet
2. Try creating a sweepstakes (you'll need SWEEP tokens)
3. Test entering a sweepstakes
4. Verify the UI displays contract data correctly

## Step 6: Get SWEEP Tokens (For Testing)

If your contracts include a faucet function or minting capability, you can mint SWEEP tokens for testing:

```bash
# Example mint command (adjust based on your contract implementation)
sui client call --package YOUR_PACKAGE_ID --module sweep_token --function mint --args YOUR_ADDRESS 1000000000000 --gas-budget 10000000
```

## Troubleshooting

### Common Issues:

1. **"Package object does not exist"**:
   - Check that PACKAGE_ID is correct
   - Ensure contracts were deployed successfully

2. **"Object not found"**:
   - Verify all object IDs in config.ts
   - Check that shared objects were created during deployment

3. **"Insufficient gas"**:
   - Ensure you have enough SUI for gas fees
   - Increase gas budget in transactions

4. **"Type not found"**:
   - Check COIN_TYPE format: `PACKAGE_ID::module_name::TYPE_NAME`
   - Ensure module and type names match your Move code

### Getting Help:

1. Check the [Sui documentation](https://docs.sui.io/)
2. Join the [Sui Discord](https://discord.gg/sui) for support
3. Review the Move contracts in `/contracts` for function signatures

## Production Deployment

For production deployment:

1. Use `mainnet` instead of `devnet`
2. Test thoroughly on `testnet` first
3. Consider using a multi-sig wallet for admin functions
4. Set up proper monitoring and alerting
5. Update `NETWORK` in config.ts to `"mainnet"`

## Security Considerations

- Never commit private keys to version control
- Use environment variables for sensitive configuration
- Test all functions thoroughly before mainnet deployment
- Consider getting a security audit for production use
