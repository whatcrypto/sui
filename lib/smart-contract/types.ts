// TypeScript interfaces for sweepstakes functionality

export interface Sweepstakes {
  id: string;
  title: string;
  description: string;
  prizeAmount: number;
  maxParticipants: number;
  participantCount: number;
  endTimestamp: number;
  deliveryInfo?: string;
  host: string;
  status: SweepstakesStatus;
  winner?: string;
  participants: string[];
  createdAt: number;
}

export enum SweepstakesStatus {
  ACTIVE = 0,
  WINNER_SELECTED = 1,
  COMPLETED = 2,
  CANCELLED = 3
}

export interface CreateSweepstakesParams {
  title: string;
  description: string;
  prizeAmount: number;
  maxParticipants: number;
  endTimestamp: number;
  deliveryInfo?: string;
}

export interface SweepstakesEntry {
  sweepstakesId: string;
  participant: string;
  entryTimestamp: number;
}

export interface ProofOfDelivery {
  sweepstakesId: string;
  proof: string;
  submittedAt: number;
}