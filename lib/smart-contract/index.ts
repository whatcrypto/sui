/**
 * Main export file for Sweepstakes Platform smart contract integration
 * Import everything you need from here
 */

export { clientTransactions } from "./client-transactions";
export { ContractQueries } from "./queries";
export {
  // Sweepstakes functions
  createSweepstakes,
  enterSweepstakes,
  selectWinner,
  submitProofOfDelivery,
  getSweepstakesInfo,
  getActiveSweepstakes,
  hasEnteredSweepstakes,
  getHostSweepstakes,
  getParticipantEntries,

  // Dispute functions
  createDispute,
  submitDisputeProof,
  getDisputeInfo,

  // Governance functions
  castGovernanceVote,
  claimVotingRewards,
  getGovernanceVoteInfo,
  getVoterRecord,

  // SWEEP token functions
  stakeSweepTokens,
  hasVotingRights,
  getPlatformInfo,

  // Helper functions
  formatSweepAmount,
  formatUsdAmount,
  formatTimestamp,
  getSweepstakesStatus,
  getDisputeStatus,
  getGovernanceVoteStatus,
} from "./utils";

// Re-export config for easy access
export { contractConfig } from "./config";
export * from "./types";
