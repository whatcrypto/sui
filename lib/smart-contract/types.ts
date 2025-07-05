// TypeScript type definitions for Sui Sweepstakes Platform

// Transaction types
export interface TransactionResult {
  digest: string;
  effects: any;
  events: any[];
  objectChanges: any[];
}

// Sweepstakes related types
export interface SweepstakesData {
  id: string;
  title: string;
  description: string;
  prizeAmount: number;
  maxParticipants: number;
  participantCount: number;
  endTimestamp: number;
  host: string;
  status: SweepstakesStatus;
  winner?: string;
  deliveryInfo?: string;
  createdAt: number;
  participants: string[];
  collateralDeposited: number;
  proofOfDelivery?: string;
}

export enum SweepstakesStatus {
  ACTIVE = 0,
  WINNER_SELECTED = 1,
  COMPLETED = 2,
  DISPUTED = 3,
  CANCELLED = 4,
}

// Dispute related types
export interface DisputeData {
  id: string;
  sweepstakesId: string;
  disputant: string;
  reason: DisputeReason;
  evidence?: string;
  status: DisputeStatus;
  createdAt: number;
  resolvedAt?: number;
  resolution?: DisputeResolution;
}

export enum DisputeReason {
  PRIZE_NOT_DELIVERED = "PRIZE_NOT_DELIVERED",
  FRAUDULENT_WINNER = "FRAUDULENT_WINNER",
  MISLEADING_DESCRIPTION = "MISLEADING_DESCRIPTION",
  OTHER = "OTHER",
}

export enum DisputeStatus {
  ACTIVE = 0,
  VOTING = 1,
  RESOLVED = 2,
  EXPIRED = 3,
}

export enum DisputeResolution {
  APPROVE_DISPUTE = "APPROVE_DISPUTE",
  REJECT_DISPUTE = "REJECT_DISPUTE",
  PARTIAL_REFUND = "PARTIAL_REFUND",
}

// Governance related types
export interface GovernanceVoteData {
  id: string;
  title: string;
  description: string;
  disputeId?: string;
  voteType: VoteType;
  options: VoteOption[];
  startTime: number;
  endTime: number;
  status: VoteStatus;
  totalVotes: number;
  votes: Record<string, VoteChoice>;
  quorumReached: boolean;
  result?: VoteChoice;
}

export enum VoteType {
  DISPUTE_RESOLUTION = "DISPUTE_RESOLUTION",
  PLATFORM_UPGRADE = "PLATFORM_UPGRADE",
  PARAMETER_CHANGE = "PARAMETER_CHANGE",
}

export interface VoteOption {
  choice: VoteChoice;
  description: string;
  votes: number;
  votingPower: number;
}

export enum VoteChoice {
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  ABSTAIN = "ABSTAIN",
}

export enum VoteStatus {
  ACTIVE = 0,
  PASSED = 1,
  FAILED = 2,
  EXPIRED = 3,
}

// SWEEP Token related types
export interface SweepTokenData {
  coinType: string;
  balance: number;
  stakedAmount: number;
  lockedAmount: number;
  rewardsEarned: number;
}

export interface VoterRecord {
  address: string;
  stakedAmount: number;
  votingPower: number;
  rewardsEarned: number;
  lastVoteTime: number;
  activeVotes: string[];
  votingHistory: VoteHistoryEntry[];
}

export interface VoteHistoryEntry {
  voteId: string;
  choice: VoteChoice;
  votingPower: number;
  timestamp: number;
  rewardEarned: number;
}

// Platform related types
export interface PlatformInfo {
  totalSweepstakes: number;
  activeSweepstakes: number;
  totalValueLocked: number;
  totalStaked: number;
  totalRewardsDistributed: number;
  platformFeeRate: number;
  minimumStake: number;
  votingPeriodMs: number;
  disputePeriodMs: number;
  sybilProtectionDelayMs: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalHosts: number;
  totalParticipants: number;
  averagePrizeAmount: number;
  successfulDeliveryRate: number;
  disputeRate: number;
  averageResolutionTime: number;
}

// Transaction builder types
export interface CreateSweepstakesParams {
  title: string;
  description: string;
  prizeAmount: number;
  maxParticipants: number;
  endTimestamp: number;
  deliveryInfo?: string;
}

export interface EnterSweepstakesParams {
  sweepstakesId: string;
}

export interface SelectWinnerParams {
  sweepstakesId: string;
}

export interface SubmitProofParams {
  sweepstakesId: string;
  proofData: string;
}

export interface CreateDisputeParams {
  sweepstakesId: string;
  reason: DisputeReason;
  evidence?: string;
}

export interface CastVoteParams {
  voteId: string;
  choice: VoteChoice;
}

export interface StakeTokensParams {
  amount: number;
}

// Query result types
export interface QueryResult<T> {
  data: T;
  hasNextPage: boolean;
  nextCursor?: string;
}

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

// Event types
export interface SweepstakesCreatedEvent {
  sweepstakesId: string;
  host: string;
  title: string;
  prizeAmount: number;
  maxParticipants: number;
  endTimestamp: number;
}

export interface ParticipantEnteredEvent {
  sweepstakesId: string;
  participant: string;
  entryTime: number;
}

export interface WinnerSelectedEvent {
  sweepstakesId: string;
  winner: string;
  prizeAmount: number;
  selectionTime: number;
}

export interface DisputeCreatedEvent {
  disputeId: string;
  sweepstakesId: string;
  disputant: string;
  reason: DisputeReason;
  createdAt: number;
}

export interface VoteCreatedEvent {
  voteId: string;
  disputeId?: string;
  voteType: VoteType;
  startTime: number;
  endTime: number;
}

export interface VoteCastEvent {
  voteId: string;
  voter: string;
  choice: VoteChoice;
  votingPower: number;
  timestamp: number;
}

// Error types
export interface ContractError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Utility types
export type Address = string;
export type ObjectId = string;
export type Timestamp = number;
export type Amount = number;

// Status helper types
export type SweepstakesStatusString =
  | "ACTIVE"
  | "WINNER_SELECTED"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED";
export type DisputeStatusString = "ACTIVE" | "VOTING" | "RESOLVED" | "EXPIRED";
export type VoteStatusString = "ACTIVE" | "PASSED" | "FAILED" | "EXPIRED";

// ===== Entry NFT Types =====

export interface EntryNFT {
  id: string;
  sweepstakesId: string;
  entryNumber: number;
  metadata: string; // Can include custom branding, QR codes, messages, etc.
  owner?: string; // Current holder of the NFT
}

export interface SweepstakesEntry {
  sweepstakesId: string;
  participantAddress: string;
  entryTime: number;
  entryNFTId: string;
  entryNumber: number;
}

// ===== Updated Sweepstakes Type =====

export interface Sweepstakes {
  id: string;
  host: string;
  title: string;
  description: string;
  prizeDescription: string;
  prizeValueUsd: number;
  collateralDepositId: string;
  startTime: number;
  endTime: number;
  maxParticipants: number;
  participants: string[];
  winner?: string;
  winnerSelectedTime?: number;
  status: SweepstakesStatus;
  proofOfDelivery?: string;
  disputeId?: string;
  sybilProtectionEnabled: boolean;
  totalEntriesMinted: number; // Total NFTs minted for this sweepstakes
  entriesUsed: number; // How many NFTs have been redeemed
}

// ===== Distribution Events =====

export interface EntryNFTsMintedEvent {
  sweepstakesId: string;
  host: string;
  quantity: number;
  timestamp: number;
}

export interface EntryNFTUsedEvent {
  sweepstakesId: string;
  entryNftId: string;
  participant: string;
  entryNumber: number;
  timestamp: number;
}

export interface EntryNFTTransferredEvent {
  nftId: string;
  from: string;
  to: string;
  timestamp: number;
}

// ===== Helper Types for Distribution =====

export interface DistributionMethod {
  type: "direct" | "email" | "link" | "qr" | "social";
  details?: {
    // For email distribution
    emails?: string[];
    // For link distribution
    uniqueLinks?: string[];
    // For QR distribution
    qrCodes?: string[];
    // For social media
    platform?: string;
    postId?: string;
  };
}

export interface EntryNFTBatch {
  sweepstakesId: string;
  nftIds: string[];
  totalCount: number;
  distributionPlan?: DistributionMethod;
}
