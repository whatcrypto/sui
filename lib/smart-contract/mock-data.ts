// Mock data manager for demo mode
// This simulates blockchain operations when contracts aren't deployed

interface MockSweepstakes {
  id: string;
  host: string | any;
  title: string;
  description: string;
  prizeDescription?: string;
  prizeValueUsd?: number;
  prizeAmount: number;
  startTime?: number;
  endTime?: number;
  endTimestamp: number;
  maxParticipants: number;
  currentParticipants?: number;
  participantCount: number;
  participants?: string[];
  enableSybilProtection?: boolean;
  status: number | any;
  winner?: string;
  proofOfDelivery?: string;
  deliveryInfo?: string;
  disputeId?: string;
  createdAt: number;
}

class MockDataManager {
  private sweepstakes: Map<string, MockSweepstakes> = new Map();
  private userEntries: Map<string, string[]> = new Map(); // user -> sweepstakesIds
  private userHosted: Map<string, string[]> = new Map(); // user -> sweepstakesIds
  private nextId: number = 4; // Start after demo data

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoSweepstakes: MockSweepstakes[] = [
      {
        id: "0xdemo1",
        host: "0xhost123456789abcdef",
        title: "iPhone 15 Pro Giveaway",
        description: "Win a brand new iPhone 15 Pro! Entry is completely free.",
        prizeDescription: "iPhone 15 Pro 256GB",
        prizeValueUsd: 1200,
        prizeAmount: 1200,
        startTime: Date.now() - 86400000,
        endTime: Date.now() + 86400000 * 6,
        endTimestamp: Date.now() + 86400000 * 6,
        maxParticipants: 1000,
        currentParticipants: 342,
        participantCount: 342,
        participants: [],
        enableSybilProtection: true,
        status: 0,
        winner: undefined,
        proofOfDelivery: undefined,
        deliveryInfo: "Shipped via FedEx with tracking",
        disputeId: undefined,
        createdAt: Date.now() - 86400000,
      },
      {
        id: "0xdemo2",
        host: "0xhost987654321fedcba",
        title: "$500 Amazon Gift Card",
        description:
          "Enter to win a $500 Amazon gift card. No purchase necessary!",
        prizeDescription: "Amazon Gift Card",
        prizeValueUsd: 500,
        prizeAmount: 500,
        startTime: Date.now() - 172800000,
        endTime: Date.now() + 86400000 * 5,
        endTimestamp: Date.now() + 86400000 * 5,
        maxParticipants: 500,
        currentParticipants: 189,
        participantCount: 189,
        participants: [],
        enableSybilProtection: true,
        status: 0,
        winner: undefined,
        proofOfDelivery: undefined,
        deliveryInfo: "Digital delivery via email",
        disputeId: undefined,
        createdAt: Date.now() - 172800000,
      },
      {
        id: "0xdemo3",
        host: "0xhost135792468bdf",
        title: "Gaming PC Setup",
        description: "Win a complete gaming PC setup worth $2000!",
        prizeDescription: "RTX 4070 Gaming PC + Monitor + Accessories",
        prizeValueUsd: 2000,
        prizeAmount: 2000,
        startTime: Date.now() - 259200000,
        endTime: Date.now() + 86400000 * 4,
        endTimestamp: Date.now() + 86400000 * 4,
        maxParticipants: 2000,
        currentParticipants: 1456,
        participantCount: 1456,
        participants: [],
        enableSybilProtection: true,
        status: 0,
        winner: undefined,
        proofOfDelivery: undefined,
        deliveryInfo: "Shipped via UPS with insurance",
        disputeId: undefined,
        createdAt: Date.now() - 259200000,
      },
    ];

    demoSweepstakes.forEach((s) => this.sweepstakes.set(s.id, s));
  }

  createSweepstakes(
    host: string,
    title: string,
    description: string,
    prizeDescription: string,
    prizeValueUsd: number,
    durationMs: number,
    maxParticipants: number,
    enableSybilProtection: boolean
  ): string {
    const id = `0xuser${this.nextId++}`;
    const sweepstake: MockSweepstakes = {
      id,
      host,
      title,
      description,
      prizeDescription,
      prizeValueUsd,
      prizeAmount: prizeValueUsd,
      startTime: Date.now(),
      endTime: Date.now() + durationMs,
      endTimestamp: Date.now() + durationMs,
      maxParticipants,
      currentParticipants: 0,
      participantCount: 0,
      participants: [],
      enableSybilProtection,
      status: 0, // Active
      winner: undefined,
      proofOfDelivery: undefined,
      deliveryInfo: "",
      disputeId: undefined,
      createdAt: Date.now(),
    };

    this.sweepstakes.set(id, sweepstake);

    // Track hosted sweepstakes
    const hosted = this.userHosted.get(host) || [];
    hosted.push(id);
    this.userHosted.set(host, hosted);

    return id;
  }

  enterSweepstakes(sweepstakesId: string, userAddress: string): boolean {
    const sweepstake = this.sweepstakes.get(sweepstakesId);
    if (!sweepstake) return false;

    // Check if already entered
    if (sweepstake.participants!.includes(userAddress)) return false;

    // Check if full
    if (sweepstake.currentParticipants! >= sweepstake.maxParticipants)
      return false;

    // Check if ended
    if (Date.now() > sweepstake.endTime!) return false;

    // Add participant
    sweepstake.participants!.push(userAddress);
    sweepstake.currentParticipants!++;

    // Track user entries
    const entries = this.userEntries.get(userAddress) || [];
    entries.push(sweepstakesId);
    this.userEntries.set(userAddress, entries);

    return true;
  }

  getActiveSweepstakes(): MockSweepstakes[] {
    return Array.from(this.sweepstakes.values()).filter(
      (s) => s.status === 0 && Date.now() < s.endTime!
    );
  }

  getSweepstakesInfo(id: string): MockSweepstakes | null {
    return this.sweepstakes.get(id) || null;
  }

  getHostSweepstakes(host: string): string[] {
    return this.userHosted.get(host) || [];
  }

  getParticipantEntries(user: string): string[] {
    return this.userEntries.get(user) || [];
  }

  hasEnteredSweepstakes(sweepstakesId: string, userAddress: string): boolean {
    const sweepstake = this.sweepstakes.get(sweepstakesId);
    return sweepstake ? sweepstake.participants!.includes(userAddress) : false;
  }

  selectWinner(sweepstakesId: string): string | null {
    const sweepstake = this.sweepstakes.get(sweepstakesId);
    if (!sweepstake || sweepstake.participants!.length === 0) return null;

    // Simple random selection for demo
    const winnerIndex = Math.floor(
      Math.random() * sweepstake.participants!.length
    );
    sweepstake.winner = sweepstake.participants![winnerIndex];
    sweepstake.status = 1; // Winner selected

    return sweepstake.winner;
  }

  submitProofOfDelivery(sweepstakesId: string, proof: string): boolean {
    const sweepstake = this.sweepstakes.get(sweepstakesId);
    if (!sweepstake || sweepstake.status !== 1) return false;

    sweepstake.proofOfDelivery = proof;
    sweepstake.status = 2; // Completed
    return true;
  }
}

// Singleton instance
export const mockDataManager = new MockDataManager();
