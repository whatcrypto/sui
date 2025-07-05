import { Transaction } from "@mysten/sui/transactions";
import { contractConfig } from "./config";
import { mockDataManager } from "./mock-data";

const { PACKAGE_ID, SWEEPSTAKES, SWEEP_TOKEN, GOVERNANCE, MOCK_MODE } =
  contractConfig;

/**
 * Client-side transaction builders for the Sweepstakes Platform
 * These functions return Transaction objects that can be executed by connected wallets
 */
export const clientTransactions = {
  /**
   * Create a new sweepstakes (requires SWEEP token collateral)
   */
  createSweepstakes: (
    title: string,
    description: string,
    prizeDescription: string,
    prizeValueUsd: number,
    durationMs: number,
    maxParticipants: number,
    enableSybilProtection: boolean,
    collateralAmount: number
  ) => {
    const transaction = new Transaction();

    // First deposit collateral
    const [collateralCoin] = transaction.splitCoins(transaction.gas, [
      transaction.pure.u64(collateralAmount),
    ]);

    transaction.moveCall({
      target: `${PACKAGE_ID}::sweep_token::deposit_collateral`,
      arguments: [
        collateralCoin,
        transaction.pure.vector(
          "u8",
          Array.from(new TextEncoder().encode(`sweepstakes_${Date.now()}`))
        ),
        transaction.object("0x6"), // Clock
      ],
    });

    // Then create sweepstakes
    transaction.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::create_sweepstakes`,
      arguments: [
        transaction.object(SWEEPSTAKES.REGISTRY),
        transaction.pure.id("0x0"), // Placeholder for collateral deposit ID
        transaction.pure.vector(
          "u8",
          Array.from(new TextEncoder().encode(title))
        ),
        transaction.pure.vector(
          "u8",
          Array.from(new TextEncoder().encode(description))
        ),
        transaction.pure.vector(
          "u8",
          Array.from(new TextEncoder().encode(prizeDescription))
        ),
        transaction.pure.u64(prizeValueUsd),
        transaction.pure.u64(durationMs),
        transaction.pure.u64(maxParticipants),
        transaction.pure.bool(enableSybilProtection),
        transaction.object("0x6"), // Clock
      ],
    });

    return transaction;
  },

  /**
   * Enter a sweepstakes (free for participants)
   */
  enterSweepstakes: (sweepstakesId: string) => {
    const transaction = new Transaction();

    transaction.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::enter_sweepstakes`,
      arguments: [
        transaction.object(SWEEPSTAKES.REGISTRY),
        transaction.object(sweepstakesId),
        transaction.object("0x6"), // Clock
      ],
    });

    return transaction;
  },

  /**
   * Enter a sweepstakes using an Entry NFT
   */
  enterSweepstakesWithNFT: (sweepstakesId: string, entryNftId: string) => {
    const transaction = new Transaction();

    transaction.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::enter_sweepstakes_with_nft`,
      arguments: [
        transaction.object(SWEEPSTAKES.REGISTRY),
        transaction.object(sweepstakesId),
        transaction.object(entryNftId), // The Entry NFT to use
        transaction.object("0x6"), // Clock
      ],
    });

    return transaction;
  },

  /**
   * Customize Entry NFT metadata (host can add branding, messages, etc.)
   */
  customizeEntryNFT: (entryNftId: string, metadata: string) => {
    const transaction = new Transaction();

    transaction.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::customize_entry_nft`,
      arguments: [
        transaction.object(entryNftId),
        transaction.pure.vector(
          "u8",
          Array.from(new TextEncoder().encode(metadata))
        ),
      ],
    });

    return transaction;
  },

  /**
   * Batch transfer Entry NFTs to multiple recipients
   */
  batchTransferEntryNFTs: (nftIds: string[], recipients: string[]) => {
    if (nftIds.length !== recipients.length) {
      throw new Error(
        "NFT IDs and recipients arrays must have the same length"
      );
    }

    const transaction = new Transaction();

    // Transfer each NFT to its corresponding recipient
    nftIds.forEach((nftId, index) => {
      transaction.transferObjects(
        [transaction.object(nftId)],
        transaction.pure.address(recipients[index])
      );
    });

    return transaction;
  },

  /**
   * Select winner for a sweepstakes (anyone can call after end time)
   */
  selectWinner: (sweepstakesId: string) => {
    const transaction = new Transaction();

    transaction.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::select_winner`,
      arguments: [
        transaction.object(SWEEPSTAKES.REGISTRY),
        transaction.object(sweepstakesId),
        transaction.object("0x8"), // Random
        transaction.object("0x6"), // Clock
      ],
    });

    return transaction;
  },

  /**
   * Submit proof of delivery (host only)
   */
  submitProofOfDelivery: (sweepstakesId: string, proofContent: string) => {
    const transaction = new Transaction();

    transaction.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::submit_proof_of_delivery`,
      arguments: [
        transaction.object(sweepstakesId),
        transaction.pure.vector(
          "u8",
          Array.from(new TextEncoder().encode(proofContent))
        ),
      ],
    });

    return transaction;
  },

  /**
   * Create dispute (winner only)
   */
  createDispute: (sweepstakesId: string, reason: string) => {
    const transaction = new Transaction();

    transaction.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::create_dispute`,
      arguments: [
        transaction.object(sweepstakesId),
        transaction.pure.vector(
          "u8",
          Array.from(new TextEncoder().encode(reason))
        ),
        transaction.object("0x6"), // Clock
      ],
    });

    return transaction;
  },

  /**
   * Submit dispute proof (host only)
   */
  submitDisputeProof: (disputeId: string, proofContent: string) => {
    const transaction = new Transaction();

    transaction.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::submit_dispute_proof`,
      arguments: [
        transaction.object(disputeId),
        transaction.pure.vector(
          "u8",
          Array.from(new TextEncoder().encode(proofContent))
        ),
      ],
    });

    return transaction;
  },

  /**
   * Stake SWEEP tokens for governance voting
   */
  stakeSweepTokens: (amount: number) => {
    const transaction = new Transaction();

    const [stakingCoin] = transaction.splitCoins(transaction.gas, [
      transaction.pure.u64(amount),
    ]);

    transaction.moveCall({
      target: `${PACKAGE_ID}::sweep_token::stake_tokens`,
      arguments: [
        transaction.object(SWEEP_TOKEN.STAKING_REGISTRY),
        stakingCoin,
        transaction.object("0x6"), // Clock
      ],
    });

    return transaction;
  },

  /**
   * Cast vote in governance (requires staked tokens)
   */
  castGovernanceVote: (voteId: string, voteChoice: boolean) => {
    const transaction = new Transaction();

    transaction.moveCall({
      target: `${PACKAGE_ID}::governance::cast_vote`,
      arguments: [
        transaction.object(voteId),
        transaction.object(SWEEP_TOKEN.PLATFORM_TREASURY),
        transaction.object(SWEEP_TOKEN.STAKING_REGISTRY),
        transaction.pure.bool(voteChoice), // true = support winner, false = support host
        transaction.object("0x6"), // Clock
      ],
    });

    return transaction;
  },

  /**
   * Claim voting rewards after governance vote resolves
   */
  claimVotingRewards: (voteId: string) => {
    const transaction = new Transaction();

    transaction.moveCall({
      target: `${PACKAGE_ID}::governance::claim_voting_rewards`,
      arguments: [transaction.object(voteId)],
    });

    return transaction;
  },
};

// ===== Helper Functions for Entry NFT Distribution =====

/**
 * Generate shareable links for Entry NFTs
 * Companies can use these for email campaigns, social media, etc.
 */
export const generateEntryLinks = (
  sweepstakesId: string,
  nftIds: string[],
  baseUrl: string = window.location.origin
): { nftId: string; link: string; qrCode: string }[] => {
  return nftIds.map((nftId) => ({
    nftId,
    link: `${baseUrl}/enter/${sweepstakesId}?nft=${nftId}`,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${baseUrl}/enter/${sweepstakesId}?nft=${nftId}`)}`,
  }));
};

/**
 * Create a CSV export of Entry NFTs for mail merge or bulk distribution
 */
export const exportEntryNFTsToCSV = (
  nfts: { id: string; entryNumber: number; link?: string }[]
): string => {
  const headers = ["NFT_ID", "Entry_Number", "Entry_Link"];
  const rows = nfts.map((nft) => [
    nft.id,
    nft.entryNumber.toString(),
    nft.link || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
};

/**
 * Helper to track Entry NFT distribution
 */
export interface DistributionTracker {
  sweepstakesId: string;
  totalNFTs: number;
  distributed: {
    nftId: string;
    recipient: string;
    method: string;
    timestamp: number;
  }[];
  pending: string[]; // NFT IDs not yet distributed
}

export const createDistributionTracker = (
  sweepstakesId: string,
  nftIds: string[]
): DistributionTracker => {
  return {
    sweepstakesId,
    totalNFTs: nftIds.length,
    distributed: [],
    pending: [...nftIds],
  };
};
