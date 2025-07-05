import { clientTransactions } from "./client-transactions";
import { ContractQueries } from "./queries";

// Initialize the queries instance
let contractQueries: ContractQueries | null = null;

// Lazy initialization to avoid circular imports
const getContractQueries = (): ContractQueries => {
  if (!contractQueries) {
    contractQueries = new ContractQueries();
  }
  return contractQueries;
};

/**
 * High-level utility functions for the Sweepstakes Platform
 * These are the functions you'll import and use in your components
 */

// ===== Sweepstakes Functions =====

export const createSweepstakes = async (
  title: string,
  description: string,
  prizeDescription: string,
  prizeValueUsd: number,
  durationMs: number,
  maxParticipants: number,
  enableSybilProtection: boolean,
  collateralAmount: number
) => {
  return clientTransactions.createSweepstakes(
    title,
    description,
    prizeDescription,
    prizeValueUsd,
    durationMs,
    maxParticipants,
    enableSybilProtection,
    collateralAmount
  );
};

export const enterSweepstakes = async (sweepstakesId: string) => {
  return clientTransactions.enterSweepstakes(sweepstakesId);
};

export const selectWinner = async (sweepstakesId: string) => {
  return clientTransactions.selectWinner(sweepstakesId);
};

export const submitProofOfDelivery = async (
  sweepstakesId: string,
  proofContent: string
) => {
  return clientTransactions.submitProofOfDelivery(sweepstakesId, proofContent);
};

// ===== Query Functions =====

export const getSweepstakesInfo = async (sweepstakesId: string) => {
  const queries = getContractQueries();
  return await queries.getSweepstakesInfo(sweepstakesId);
};

export const getActiveSweepstakes = async () => {
  const queries = getContractQueries();
  return await queries.getActiveSweepstakes();
};

export const hasEnteredSweepstakes = async (
  sweepstakesId: string,
  userAddress: string
) => {
  const queries = getContractQueries();
  return await queries.hasEnteredSweepstakes(sweepstakesId, userAddress);
};

export const getHostSweepstakes = async (userAddress: string) => {
  const queries = getContractQueries();
  return await queries.getHostSweepstakes(userAddress);
};

export const getParticipantEntries = async (userAddress: string) => {
  const queries = getContractQueries();
  return await queries.getParticipantEntries(userAddress);
};

// ===== Dispute Functions =====

export const createDispute = async (
  sweepstakesId: string,
  reason: string,
  evidence?: string
) => {
  return clientTransactions.createDispute(sweepstakesId, reason);
};

export const submitDisputeProof = async (
  disputeId: string,
  proofContent: string
) => {
  return clientTransactions.submitDisputeProof(disputeId, proofContent);
};

export const getDisputeInfo = async (disputeId: string) => {
  const queries = getContractQueries();
  return await queries.getDisputeInfo(disputeId);
};

// ===== Governance Functions =====

export const castGovernanceVote = async (
  voteId: string,
  voteChoice: boolean
) => {
  return clientTransactions.castGovernanceVote(voteId, voteChoice);
};

export const claimVotingRewards = async (voteId: string) => {
  return clientTransactions.claimVotingRewards(voteId);
};

export const getGovernanceVoteInfo = async (voteId: string) => {
  const queries = getContractQueries();
  return await queries.getGovernanceVoteInfo(voteId);
};

export const getVoterRecord = async (voteId: string, voterAddress: string) => {
  const queries = getContractQueries();
  return await queries.getVoterRecord(voteId, voterAddress);
};

// ===== SWEEP Token Functions =====

export const stakeSweepTokens = async (amount: number) => {
  return clientTransactions.stakeSweepTokens(amount);
};

export const hasVotingRights = async (userAddress: string) => {
  const queries = getContractQueries();
  return await queries.hasVotingRights(userAddress);
};

export const getPlatformInfo = async () => {
  const queries = getContractQueries();
  return await queries.getPlatformInfo();
};

// ===== Helper Functions =====

export const formatSweepAmount = (amount: number | string) => {
  return (Number(amount) / 1000000000).toFixed(2); // Convert from smallest unit to SWEEP
};

export const formatUsdAmount = (cents: number | string) => {
  return (Number(cents) / 100).toFixed(2); // Convert cents to dollars
};

export const formatTimestamp = (timestamp: number | string) => {
  return new Date(Number(timestamp)).toLocaleString();
};

export const getSweepstakesStatus = (status: number) => {
  const statusMap: Record<number, string> = {
    0: "Active",
    1: "Ended",
    2: "Disputed",
    3: "Resolved",
  };
  return statusMap[status] || "Unknown";
};

export const getDisputeStatus = (status: number) => {
  const statusMap: Record<number, string> = {
    0: "Open",
    1: "Proof Submitted",
    2: "Voting",
    3: "Resolved",
  };
  return statusMap[status] || "Unknown";
};

export const getGovernanceVoteStatus = (status: number) => {
  const statusMap: Record<number, string> = {
    0: "Active",
    1: "Resolved for Winner",
    2: "Resolved for Host",
    3: "Quorum Failed",
  };
  return statusMap[status] || "Unknown";
};
