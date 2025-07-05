import { bcs, fromHex, toHex } from "@mysten/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { contractConfig } from "./config";
import { SweepstakesData } from "./types";
import { mockDataManager } from "./mock-data";

const { PACKAGE_ID, SWEEPSTAKES, SWEEP_TOKEN, GOVERNANCE, MOCK_MODE } = contractConfig;

/**
 * Query class for reading data from the Sweepstakes Platform smart contracts
 * Uses devInspectTransactionBlock for read-only operations
 */
export class ContractQueries {
  private keypair: Ed25519Keypair;
  private client: SuiClient;
  private Address: any;

  constructor() {
    // For production, use environment variables or a more secure method
    const privateKey =
      process.env.NEXT_PUBLIC_QUERY_PRIVATE_KEY ||
      "suiprivkey1qr4uu3cpez087ml9u3lcdvp8lahlw9sal4mfkjtcukuv3y6pdtd5w0tl0zz";

    if (!privateKey) {
      throw new Error("Please set your private key in environment variables");
    }

    this.keypair = Ed25519Keypair.fromSecretKey(
      decodeSuiPrivateKey(privateKey).secretKey
    );
    this.client = new SuiClient({ url: getFullnodeUrl("devnet") }); // Change network as needed
    this.Address = bcs.bytes(32).transform({
      input: (val: string) => fromHex(val),
      output: (val: Uint8Array) => toHex(val),
    });
  }

  async devInspectTransactionBlock(transaction: Transaction) {
    try {
      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: transaction,
        sender: this.keypair.getPublicKey().toSuiAddress(),
      });
      return result.results
        ? result.results.map((result) => result.returnValues)
        : null;
    } catch (error) {
      console.error("Error executing query:", error);
      return null;
    }
  }

  /**
   * Get sweepstakes information
   */
  async getSweepstakesInfo(sweepstakesId: string) {
    if (MOCK_MODE) {
      return mockDataManager.getSweepstakesInfo(sweepstakesId);
    }
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::get_sweepstakes_info`,
      arguments: [txn.object(sweepstakesId)],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    if (returnValues && returnValues[0]) {
      return {
        host: `0x${this.Address.parse(Uint8Array.from(returnValues[0][0][0]))}`,
        title: bcs.string().parse(Uint8Array.from(returnValues[0][1][0])),
        description: bcs.string().parse(Uint8Array.from(returnValues[0][2][0])),
        prizeDescription: bcs
          .string()
          .parse(Uint8Array.from(returnValues[0][3][0])),
        prizeValueUsd: bcs.u64().parse(Uint8Array.from(returnValues[0][4][0])),
        startTime: bcs.u64().parse(Uint8Array.from(returnValues[0][5][0])),
        endTime: bcs.u64().parse(Uint8Array.from(returnValues[0][6][0])),
        maxParticipants: bcs
          .u64()
          .parse(Uint8Array.from(returnValues[0][7][0])),
        currentParticipants: bcs
          .u64()
          .parse(Uint8Array.from(returnValues[0][8][0])),
        winner: returnValues[0][9][0]
          ? `0x${this.Address.parse(Uint8Array.from(returnValues[0][9][0]))}`
          : null,
        status: bcs.u8().parse(Uint8Array.from(returnValues[0][10][0])),
        sybilProtectionEnabled: bcs
          .bool()
          .parse(Uint8Array.from(returnValues[0][11][0])),
      };
    }
    return null;
  }

  /**
   * Get all active sweepstakes
   */
  async getActiveSweepstakes() {
    // Mock mode - return demo data
    if (MOCK_MODE) {
      return mockDataManager.getActiveSweepstakes();
    }
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::get_registry_stats`,
      arguments: [txn.object(SWEEPSTAKES.REGISTRY)],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    if (returnValues && returnValues[0]) {
      // This is a simplified version - in practice you'd need to iterate through all sweepstakes
      return {
        totalSweepstakes: bcs
          .u64()
          .parse(Uint8Array.from(returnValues[0][0][0])),
        activeSweepstakes: bcs
          .u64()
          .parse(Uint8Array.from(returnValues[0][1][0])),
        totalParticipants: bcs
          .u64()
          .parse(Uint8Array.from(returnValues[0][2][0])),
      };
    }
    return null;
  }

  /**
   * Check if user has entered a specific sweepstakes
   */
  async hasEnteredSweepstakes(sweepstakesId: string, userAddress: string) {
    if (MOCK_MODE) {
      return mockDataManager.hasEnteredSweepstakes(sweepstakesId, userAddress);
    }
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::has_entered_sweepstakes`,
      arguments: [txn.object(sweepstakesId), txn.pure.address(userAddress)],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    return returnValues && returnValues[0]
      ? bcs.bool().parse(Uint8Array.from(returnValues[0][0][0]))
      : false;
  }

  /**
   * Get user's hosted sweepstakes
   */
  async getHostSweepstakes(userAddress: string) {
    if (MOCK_MODE) {
      return mockDataManager.getHostSweepstakes(userAddress);
    }
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::get_host_sweepstakes`,
      arguments: [
        txn.object(SWEEPSTAKES.REGISTRY),
        txn.pure.address(userAddress),
      ],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    if (returnValues && returnValues[0]) {
      const sweepstakesIds = bcs
        .vector(bcs.bytes(32))
        .parse(Uint8Array.from(returnValues[0][0][0]));
      return sweepstakesIds.map((id) => `0x${toHex(id)}`);
    }
    return [];
  }

  /**
   * Get user's participant entries
   */
  async getParticipantEntries(userAddress: string) {
    if (MOCK_MODE) {
      return mockDataManager.getParticipantEntries(userAddress);
    }
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::get_participant_entries`,
      arguments: [
        txn.object(SWEEPSTAKES.REGISTRY),
        txn.pure.address(userAddress),
      ],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    if (returnValues && returnValues[0]) {
      const entryIds = bcs
        .vector(bcs.bytes(32))
        .parse(Uint8Array.from(returnValues[0][0][0]));
      return entryIds.map((id) => `0x${toHex(id)}`);
    }
    return [];
  }

  /**
   * Get dispute information
   */
  async getDisputeInfo(disputeId: string) {
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::sweepstakes::get_dispute_info`,
      arguments: [txn.object(disputeId)],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    if (returnValues && returnValues[0]) {
      return {
        sweepstakesId: `0x${toHex(Uint8Array.from(returnValues[0][0][0]))}`,
        winner: `0x${this.Address.parse(
          Uint8Array.from(returnValues[0][1][0])
        )}`,
        host: `0x${this.Address.parse(Uint8Array.from(returnValues[0][2][0]))}`,
        disputeReason: bcs
          .string()
          .parse(Uint8Array.from(returnValues[0][3][0])),
        createdTime: bcs.u64().parse(Uint8Array.from(returnValues[0][4][0])),
        proofSubmitted: bcs
          .bool()
          .parse(Uint8Array.from(returnValues[0][5][0])),
        proofContent: returnValues[0][6][0]
          ? bcs.string().parse(Uint8Array.from(returnValues[0][6][0]))
          : null,
        status: bcs.u8().parse(Uint8Array.from(returnValues[0][7][0])),
      };
    }
    return null;
  }

  /**
   * Get governance vote information
   */
  async getGovernanceVoteInfo(voteId: string) {
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::governance::get_vote_info`,
      arguments: [txn.object(voteId)],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    if (returnValues && returnValues[0]) {
      return {
        disputeId: `0x${toHex(Uint8Array.from(returnValues[0][0][0]))}`,
        sweepstakesId: `0x${toHex(Uint8Array.from(returnValues[0][1][0]))}`,
        disputeTitle: bcs
          .string()
          .parse(Uint8Array.from(returnValues[0][2][0])),
        disputeDescription: bcs
          .string()
          .parse(Uint8Array.from(returnValues[0][3][0])),
        hostProof: returnValues[0][4][0]
          ? bcs.string().parse(Uint8Array.from(returnValues[0][4][0]))
          : null,
        createdTime: bcs.u64().parse(Uint8Array.from(returnValues[0][5][0])),
        votingEndTime: bcs.u64().parse(Uint8Array.from(returnValues[0][6][0])),
        votesForWinner: bcs.u64().parse(Uint8Array.from(returnValues[0][7][0])),
        votesForHost: bcs.u64().parse(Uint8Array.from(returnValues[0][8][0])),
        totalVotingPower: bcs
          .u64()
          .parse(Uint8Array.from(returnValues[0][9][0])),
        status: bcs.u8().parse(Uint8Array.from(returnValues[0][10][0])),
        resolutionTime: returnValues[0][11][0]
          ? bcs.u64().parse(Uint8Array.from(returnValues[0][11][0]))
          : null,
        rewardPoolValue: bcs
          .u64()
          .parse(Uint8Array.from(returnValues[0][12][0])),
      };
    }
    return null;
  }

  /**
   * Get user's voting record for a specific governance vote
   */
  async getVoterRecord(voteId: string, voterAddress: string) {
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::governance::get_voter_record`,
      arguments: [txn.object(voteId), txn.pure.address(voterAddress)],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    if (returnValues && returnValues[0] && returnValues[0][0]) {
      return {
        vote: bcs.bool().parse(Uint8Array.from(returnValues[0][0][0])),
        votingPower: bcs.u64().parse(Uint8Array.from(returnValues[0][1][0])),
        voteTime: bcs.u64().parse(Uint8Array.from(returnValues[0][2][0])),
        rewardClaimed: bcs.bool().parse(Uint8Array.from(returnValues[0][3][0])),
      };
    }
    return null;
  }

  /**
   * Check if user has sufficient voting rights
   */
  async hasVotingRights(userAddress: string) {
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::sweep_token::has_voting_rights`,
      arguments: [
        txn.object(SWEEP_TOKEN.PLATFORM_TREASURY),
        txn.object(SWEEP_TOKEN.STAKING_REGISTRY),
        txn.pure.address(userAddress),
      ],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    return returnValues && returnValues[0]
      ? bcs.bool().parse(Uint8Array.from(returnValues[0][0][0]))
      : false;
  }

  /**
   * Get platform treasury information
   */
  async getPlatformInfo() {
    const txn = new Transaction();
    txn.moveCall({
      target: `${PACKAGE_ID}::sweep_token::get_platform_info`,
      arguments: [txn.object(SWEEP_TOKEN.PLATFORM_TREASURY)],
    });

    const returnValues = await this.devInspectTransactionBlock(txn);

    if (returnValues && returnValues[0]) {
      return {
        totalStaked: bcs.u64().parse(Uint8Array.from(returnValues[0][0][0])),
        platformFeeRate: bcs
          .u64()
          .parse(Uint8Array.from(returnValues[0][1][0])),
        minimumStakeForVoting: bcs
          .u64()
          .parse(Uint8Array.from(returnValues[0][2][0])),
        admin: `0x${this.Address.parse(
          Uint8Array.from(returnValues[0][3][0])
        )}`,
      };
    }
    return null;
  }
}
