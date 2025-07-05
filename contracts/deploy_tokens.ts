import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/sui.js/utils";

// Configuration
const PACKAGE_ID = "0x..."; // Replace with your deployed package ID
const TREASURY_OBJECT_ID = "0x..."; // Replace with treasury object ID after deployment
const STAKING_REGISTRY_ID = "0x..."; // Replace with staking registry object ID after deployment

// Token allocation (in SWEEP tokens with 6 decimals)
const INITIAL_SUPPLY = 1000000000 * 1000000; // 1 billion SWEEP
const TEAM_ALLOCATION = 150000000 * 1000000; // 150 million SWEEP (15%)
const TREASURY_ALLOCATION = 200000000 * 1000000; // 200 million SWEEP (20%)
const COMMUNITY_ALLOCATION = 300000000 * 1000000; // 300 million SWEEP (30%)
const ECOSYSTEM_ALLOCATION = 200000000 * 1000000; // 200 million SWEEP (20%)
const PUBLIC_SALE_ALLOCATION = 100000000 * 1000000; // 100 million SWEEP (10%)
const PRIVATE_SALE_ALLOCATION = 50000000 * 1000000; // 50 million SWEEP (5%)

// Your Sui address
const DEPLOYER_ADDRESS =
  "0x996e6d8186c44ebca2602b54bc7175cc538cf8164d78c5074ff26d06ddebf653";

// Initialize Sui client
const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });

// Load your keypair (replace with your actual private key)
const privateKey = process.env.SUI_PRIVATE_KEY || "";
const keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey));

/**
 * Mint initial token allocation for platform launch
 * This creates the foundation for collateral and staking systems
 */
async function mintInitialTokens() {
  console.log("🚀 Starting initial token minting...");

  const tx = new TransactionBlock();

  // Mint team allocation
  tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::mint_tokens_with_allocation`,
    arguments: [
      tx.object(TREASURY_OBJECT_ID),
      tx.pure(TEAM_ALLOCATION),
      tx.pure(DEPLOYER_ADDRESS), // Team wallet
      tx.pure(0), // Team allocation type
    ],
  });

  // Mint treasury allocation
  tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::mint_tokens_with_allocation`,
    arguments: [
      tx.object(TREASURY_OBJECT_ID),
      tx.pure(TREASURY_ALLOCATION),
      tx.pure(DEPLOYER_ADDRESS), // Treasury wallet
      tx.pure(1), // Treasury allocation type
    ],
  });

  // Mint community allocation
  tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::mint_tokens_with_allocation`,
    arguments: [
      tx.object(TREASURY_OBJECT_ID),
      tx.pure(COMMUNITY_ALLOCATION),
      tx.pure(DEPLOYER_ADDRESS), // Community wallet
      tx.pure(2), // Community allocation type
    ],
  });

  // Mint ecosystem allocation
  tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::mint_tokens_with_allocation`,
    arguments: [
      tx.object(TREASURY_OBJECT_ID),
      tx.pure(ECOSYSTEM_ALLOCATION),
      tx.pure(DEPLOYER_ADDRESS), // Ecosystem wallet
      tx.pure(3), // Ecosystem allocation type
    ],
  });

  // Mint public sale allocation
  tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::mint_tokens_with_allocation`,
    arguments: [
      tx.object(TREASURY_OBJECT_ID),
      tx.pure(PUBLIC_SALE_ALLOCATION),
      tx.pure(DEPLOYER_ADDRESS), // Public sale wallet
      tx.pure(4), // Public sale allocation type
    ],
  });

  // Mint private sale allocation
  tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::mint_tokens_with_allocation`,
    arguments: [
      tx.object(TREASURY_OBJECT_ID),
      tx.pure(PRIVATE_SALE_ALLOCATION),
      tx.pure(DEPLOYER_ADDRESS), // Private sale wallet
      tx.pure(5), // Private sale allocation type
    ],
  });

  try {
    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    console.log("✅ Initial token minting successful!");
    console.log("Transaction digest:", result.digest);
    console.log("Total tokens minted:", INITIAL_SUPPLY / 1000000, "SWEEP");

    return result;
  } catch (error) {
    console.error("❌ Token minting failed:", error);
    throw error;
  }
}

/**
 * Create a test sweepstakes with collateral deposit
 * This demonstrates the collateral system in action
 */
async function createTestSweepstakes() {
  console.log("🎯 Creating test sweepstakes with collateral...");

  const tx = new TransactionBlock();

  // First, deposit collateral for the sweepstakes
  const collateralAmount = 1000 * 1000000; // 1000 SWEEP tokens

  tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::deposit_collateral`,
    arguments: [
      tx.object(TREASURY_OBJECT_ID),
      tx.pure("0x1234567890abcdef"), // Placeholder sweepstakes ID
      tx.splitCoins(tx.gas, [tx.pure(collateralAmount)]),
    ],
  });

  try {
    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    console.log("✅ Test sweepstakes collateral deposited!");
    console.log("Collateral amount:", collateralAmount / 1000000, "SWEEP");

    return result;
  } catch (error) {
    console.error("❌ Test sweepstakes creation failed:", error);
    throw error;
  }
}

/**
 * Stake tokens to demonstrate staking functionality
 */
async function stakeTokens() {
  console.log("🔒 Staking tokens for rewards...");

  const tx = new TransactionBlock();
  const stakeAmount = 500 * 1000000; // 500 SWEEP tokens
  const lockPeriod = 2592000000; // 30 days in milliseconds

  tx.moveCall({
    target: `${PACKAGE_ID}::sweep_token::stake_tokens`,
    arguments: [
      tx.object(STAKING_REGISTRY_ID),
      tx.splitCoins(tx.gas, [tx.pure(stakeAmount)]),
      tx.pure(lockPeriod),
    ],
  });

  try {
    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    console.log("✅ Tokens staked successfully!");
    console.log("Staked amount:", stakeAmount / 1000000, "SWEEP");
    console.log("Lock period:", lockPeriod / (1000 * 60 * 60 * 24), "days");

    return result;
  } catch (error) {
    console.error("❌ Token staking failed:", error);
    throw error;
  }
}

/**
 * Get platform statistics
 */
async function getPlatformStats() {
  console.log("📊 Getting platform statistics...");

  try {
    // Get treasury stats
    const treasuryStats = await client.devInspectTransactionBlock({
      transactionBlock: {
        kind: "moveCall",
        data: {
          target: `${PACKAGE_ID}::sweep_token::get_treasury_stats`,
          arguments: [TREASURY_OBJECT_ID],
        },
      },
      sender: DEPLOYER_ADDRESS,
    });

    // Get staking stats
    const stakingStats = await client.devInspectTransactionBlock({
      transactionBlock: {
        kind: "moveCall",
        data: {
          target: `${PACKAGE_ID}::sweep_token::get_staking_stats`,
          arguments: [STAKING_REGISTRY_ID],
        },
      },
      sender: DEPLOYER_ADDRESS,
    });

    console.log("✅ Platform statistics retrieved!");
    console.log("Treasury stats:", treasuryStats);
    console.log("Staking stats:", stakingStats);

    return { treasuryStats, stakingStats };
  } catch (error) {
    console.error("❌ Failed to get platform stats:", error);
    throw error;
  }
}

/**
 * Main deployment function
 */
async function deployTokens() {
  try {
    console.log("🎉 Starting SWEEP token deployment...");
    console.log("Deployer address:", DEPLOYER_ADDRESS);

    // Step 1: Mint initial tokens
    await mintInitialTokens();

    // Step 2: Create test sweepstakes with collateral
    await createTestSweepstakes();

    // Step 3: Stake tokens
    await stakeTokens();

    // Step 4: Get platform stats
    await getPlatformStats();

    console.log("🎉 Token deployment completed successfully!");
    console.log("The SWEEP token system is now operational with:");
    console.log("- 1 billion SWEEP tokens minted");
    console.log("- Collateral system ready for sweepstakes");
    console.log("- Staking system active with rewards");
    console.log("- Governance voting enabled");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  deployTokens();
}

export {
  deployTokens,
  mintInitialTokens,
  createTestSweepstakes,
  stakeTokens,
  getPlatformStats,
};
