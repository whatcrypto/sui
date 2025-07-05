// Smart Contract Configuration for Sui Sweepstakes Platform
// This file contains all the contract addresses and platform settings
//
// IMPORTANT: Before using this platform, you need to:
// 1. Deploy the Move contracts in the /contracts folder using `sui client publish`
// 2. Update the PACKAGE_ID below with the deployed package ID
// 3. Update all object IDs (PLATFORM_TREASURY, STAKING_REGISTRY, etc.) with actual deployed object IDs
// 4. The current values are placeholders and will cause errors if used

export interface ContractConfig {
  PACKAGE_ID: string;
  SWEEP_TOKEN: {
    PLATFORM_TREASURY: string;
    STAKING_REGISTRY: string;
    COIN_TYPE: string;
  };
  SWEEPSTAKES: {
    REGISTRY: string;
  };
  GOVERNANCE: {
    REGISTRY: string;
  };
  NETWORK: "mainnet" | "testnet" | "devnet" | "localnet";
  MOCK_MODE: boolean; // Set to true to use mock data instead of real contracts
  PLATFORM_CONFIG: {
    PLATFORM_FEE_RATE: number;
    MINIMUM_STAKE_FOR_VOTING: string;
    VOTING_PERIOD_MS: number;
    DISPUTE_PERIOD_MS: number;
    SYBIL_PROTECTION_DELAY_MS: number;
  };
}

export const contractConfig: ContractConfig = {
  // TODO: Replace with actual deployed package ID after running `sui client publish`
  // This is a placeholder - you need to deploy the Move contracts first
  PACKAGE_ID:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  SWEEP_TOKEN: {
    // TODO: Replace with actual deployed object IDs after contract deployment
    PLATFORM_TREASURY:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    STAKING_REGISTRY:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    COIN_TYPE:
      "0x0000000000000000000000000000000000000000000000000000000000000000::sweep_token::SWEEP_TOKEN",
  },
  SWEEPSTAKES: {
    REGISTRY:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
  },
  GOVERNANCE: {
    REGISTRY:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
  },
  NETWORK: "devnet",
  MOCK_MODE: true, // Set to false after deploying contracts and updating IDs above
  // When MOCK_MODE is true, the UI will simulate contract interactions for demo purposes
  PLATFORM_CONFIG: {
    PLATFORM_FEE_RATE: 300, // 3% platform fee (in basis points)
    MINIMUM_STAKE_FOR_VOTING: "1000000000000", // 1000 SWEEP tokens in base units
    VOTING_PERIOD_MS: 604800000, // 7 days in milliseconds
    DISPUTE_PERIOD_MS: 604800000, // 7 days in milliseconds
    SYBIL_PROTECTION_DELAY_MS: 86400000, // 24 hours in milliseconds
  },
};

export default contractConfig;
