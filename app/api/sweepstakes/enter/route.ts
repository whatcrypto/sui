import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

// POST /api/sweepstakes/enter - Enter a sweepstakes
export async function POST(request: NextRequest) {
  try {
    const {
      sweepstakesId,
      participantName,
      participantEmail,
      socialActions = [], // Optional social sharing actions for bonus entries
    } = await request.json();

    // Validate required fields
    if (!sweepstakesId || !participantName || !participantEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participantEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Hash email for privacy (used on-chain)
    const emailHash = createHash("sha256")
      .update(participantEmail.toLowerCase())
      .digest("hex");

    // Generate unique entry ID
    const entryId = `ENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate bonus entries from social actions
    const bonusEntries = socialActions.length;

    // In production, this would:
    // 1. Check if user already entered
    // 2. Create Entry NFT on blockchain
    // 3. Use treasury wallet to pay gas fees
    // 4. Store entry in database

    // Mock blockchain transaction
    const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Create entry record
    const entryData = {
      id: entryId,
      sweepstakesId,
      participantName,
      participantEmail,
      emailHash,
      bonusEntries,
      socialActions,
      transactionHash: mockTransactionHash,
      timestamp: new Date().toISOString(),
      nftId: `nft_${entryId}`,
      entryNumber: Math.floor(Math.random() * 10000) + 1, // Mock entry number
      verificationCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
    };

    // In production: await database.entries.create(entryData);

    return NextResponse.json({
      success: true,
      entry: entryData,
      message: "Successfully entered sweepstakes!",
      // Provide verification info
      verification: {
        entryId,
        verificationCode: entryData.verificationCode,
        transactionHash: mockTransactionHash,
        verificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${sweepstakesId}?entry=${entryId}`,
      },
    });
  } catch (error) {
    console.error("Error entering sweepstakes:", error);
    return NextResponse.json(
      { error: "Failed to enter sweepstakes" },
      { status: 500 }
    );
  }
}

// GET /api/sweepstakes/enter?sweepstakesId=X - Get entry form data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sweepstakesId = searchParams.get("sweepstakesId");

    if (!sweepstakesId) {
      return NextResponse.json(
        { error: "Missing sweepstakesId parameter" },
        { status: 400 }
      );
    }

    // Mock sweepstakes data
    const mockSweepstakes = {
      id: sweepstakesId,
      title: "Holiday Giveaway 2024",
      description: "Win amazing prizes this holiday season!",
      prizeDescription: 'MacBook Pro 16" + AirPods Pro',
      prizeValue: 299900,
      endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxEntries: 10000,
      winnersCount: 3,
      totalEntries: 1247,
      isActive: true,
      winnersSelected: false,
      socialActions: [
        { type: "twitter_follow", label: "Follow @SweepChain", bonus: 1 },
        { type: "twitter_retweet", label: "Retweet this post", bonus: 1 },
        { type: "instagram_follow", label: "Follow on Instagram", bonus: 1 },
        {
          type: "newsletter_signup",
          label: "Subscribe to newsletter",
          bonus: 2,
        },
      ],
      rules: [
        "Must be 18 or older to enter",
        "One entry per person",
        "Winners will be selected randomly",
        "No purchase necessary",
        "Void where prohibited",
      ],
    };

    // Check if sweepstakes is still active
    if (mockSweepstakes.endTime < Date.now()) {
      return NextResponse.json(
        { error: "Sweepstakes has ended" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sweepstakes: mockSweepstakes,
    });
  } catch (error) {
    console.error("Error fetching sweepstakes:", error);
    return NextResponse.json(
      { error: "Failed to fetch sweepstakes data" },
      { status: 500 }
    );
  }
}
