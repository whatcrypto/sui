// Simple transaction interface for compatibility
interface Transaction {
  moveCall: (options: any) => void;
  pure: {
    string: (value: string) => any;
    u64: (value: number) => any;
    u32: (value: number) => any;
  };
}

// Create a mock transaction class
class MockTransaction implements Transaction {
  moveCall(options: any): void {
    console.log("Mock transaction moveCall:", options);
  }
  
  pure = {
    string: (value: string) => ({ type: "string", value }),
    u64: (value: number) => ({ type: "u64", value }),
    u32: (value: number) => ({ type: "u32", value })
  };
}

import { 
  Sweepstakes, 
  SweepstakesStatus, 
  CreateSweepstakesParams,
  SweepstakesEntry 
} from "./types";

// Mock data for development - replace with actual smart contract calls
const mockSweepstakes: Sweepstakes[] = [
  {
    id: "sweep_1",
    title: "Gaming Setup Giveaway",
    description: "Win a complete gaming setup worth $2000!",
    prizeAmount: 1000000000, // 1 SWEEP in base units
    maxParticipants: 100,
    participantCount: 25,
    endTimestamp: Date.now() + 86400000 * 7, // 7 days from now
    deliveryInfo: "Worldwide shipping included",
    host: "0x996e6d8186c44ebca2602b54bc7175cc538cf8164d78c5074ff26d06ddebf653",
    status: SweepstakesStatus.ACTIVE,
    participants: [],
    createdAt: Date.now() - 86400000 // 1 day ago
  },
  {
    id: "sweep_2", 
    title: "NFT Collection Drop",
    description: "Exclusive NFT collection with utility features",
    prizeAmount: 500000000, // 0.5 SWEEP
    maxParticipants: 50,
    participantCount: 12,
    endTimestamp: Date.now() + 86400000 * 3, // 3 days from now
    host: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
    status: SweepstakesStatus.ACTIVE,
    participants: [],
    createdAt: Date.now() - 86400000 * 2 // 2 days ago
  }
];

let mockEntries: SweepstakesEntry[] = [];

/**
 * Create a new sweepstakes
 */
export async function createSweepstakes(
  title: string,
  description: string,
  prizeAmount: number,
  maxParticipants: number,
  endTimestamp: number,
  deliveryInfo?: string
): Promise<Transaction> {
  const transaction = new MockTransaction();
  
  // In a real implementation, this would call the smart contract
  // For now, we'll create a mock transaction
  transaction.moveCall({
    target: "0x1::sweepstakes::create_sweepstakes",
    arguments: [
      transaction.pure.string(title),
      transaction.pure.string(description),
      transaction.pure.u64(prizeAmount),
      transaction.pure.u32(maxParticipants),
      transaction.pure.u64(endTimestamp),
      transaction.pure.string(deliveryInfo || "")
    ]
  });

  return transaction;
}

/**
 * Enter a sweepstakes
 */
export async function enterSweepstakes(sweepstakesId: string): Promise<Transaction> {
  const transaction = new MockTransaction();
  
  transaction.moveCall({
    target: "0x1::sweepstakes::enter_sweepstakes", 
    arguments: [
      transaction.pure.string(sweepstakesId)
    ]
  });

  return transaction;
}

/**
 * Select winner for a sweepstakes
 */
export async function selectWinner(sweepstakesId: string): Promise<Transaction> {
  const transaction = new MockTransaction();
  
  transaction.moveCall({
    target: "0x1::sweepstakes::select_winner",
    arguments: [
      transaction.pure.string(sweepstakesId)
    ]
  });

  return transaction;
}

/**
 * Submit proof of delivery
 */
export async function submitProofOfDelivery(
  sweepstakesId: string, 
  proofData: string
): Promise<Transaction> {
  const transaction = new MockTransaction();
  
  transaction.moveCall({
    target: "0x1::sweepstakes::submit_proof",
    arguments: [
      transaction.pure.string(sweepstakesId),
      transaction.pure.string(proofData)
    ]
  });

  return transaction;
}

/**
 * Get all active sweepstakes
 */
export async function getActiveSweepstakes(): Promise<Sweepstakes[]> {
  // Mock implementation - replace with actual smart contract query
  return mockSweepstakes.filter(s => s.status === SweepstakesStatus.ACTIVE);
}

/**
 * Get sweepstakes hosted by a specific address
 */
export async function getHostSweepstakes(hostAddress: string): Promise<Sweepstakes[]> {
  // Mock implementation 
  return mockSweepstakes.filter(s => s.host === hostAddress);
}

/**
 * Get sweepstakes entries for a participant
 */
export async function getParticipantEntries(participantAddress: string): Promise<Sweepstakes[]> {
  // Mock implementation
  const enteredIds = mockEntries
    .filter(e => e.participant === participantAddress)
    .map(e => e.sweepstakesId);
  
  return mockSweepstakes.filter(s => enteredIds.indexOf(s.id) !== -1);
}

/**
 * Check if user has entered a specific sweepstakes
 */
export async function hasEnteredSweepstakes(
  sweepstakesId: string, 
  participantAddress: string
): Promise<boolean> {
  return mockEntries.some(e => 
    e.sweepstakesId === sweepstakesId && e.participant === participantAddress
  );
}

/**
 * Get detailed information about a specific sweepstakes
 */
export async function getSweepstakesInfo(sweepstakesId: string): Promise<Sweepstakes | null> {
  return mockSweepstakes.find(s => s.id === sweepstakesId) || null;
}

/**
 * Format SWEEP amount for display
 */
export function formatSweepAmount(amount: number): string {
  return (amount / 1000000000).toFixed(2);
}

/**
 * Format USD amount for display
 */
export function formatUsdAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Get sweepstakes status string
 */
export function getSweepstakesStatus(status: SweepstakesStatus): string {
  switch (status) {
    case SweepstakesStatus.ACTIVE:
      return "ACTIVE";
    case SweepstakesStatus.WINNER_SELECTED:
      return "WINNER_SELECTED";
    case SweepstakesStatus.COMPLETED:
      return "COMPLETED";
    case SweepstakesStatus.CANCELLED:
      return "CANCELLED";
    default:
      return "UNKNOWN";
  }
}