import { NextRequest, NextResponse } from "next/server";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/sui.js/utils";

// Initialize Sui client
const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"), // Use testnet for development
});

// Treasury wallet for gas fee abstraction
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
const treasuryKeypair = TREASURY_PRIVATE_KEY
  ? Ed25519Keypair.fromSecretKey(fromB64(TREASURY_PRIVATE_KEY))
  : null;

// Contract addresses (will be set after deployment)
const SWEEPSTAKES_PACKAGE_ID = process.env.SWEEPSTAKES_PACKAGE_ID;
const PLATFORM_CONFIG_ID = process.env.PLATFORM_CONFIG_ID;

// POST /api/sweepstakes - Create new sweepstakes
export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      prizeDescription,
      prizeValue,
      endTime,
      maxEntries,
      winnersCount,
      hostEmail,
      paymentToken, // In production, this would be a payment confirmation
    } = await request.json();

    // Validate required fields
    if (
      !title ||
      !description ||
      !prizeDescription ||
      !prizeValue ||
      !endTime
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate fee based on prize value and features
    const baseFee = 29900; // $299 base fee in cents
    const prizeMultiplier = prizeValue > 100000 ? 2 : 1; // 2x for prizes over $1000
    const totalFee = baseFee * prizeMultiplier;

    // In production, verify payment here
    // For now, we'll simulate successful payment

    if (!treasuryKeypair || !SWEEPSTAKES_PACKAGE_ID) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create transaction to deploy sweepstakes
    const tx = new TransactionBlock();

    // For demo purposes, we'll create a mock response
    // In production, this would call the actual smart contract
    const mockSweepstakesId = `sweepstakes_${Date.now()}`;

    const sweepstakesData = {
      id: mockSweepstakesId,
      title,
      description,
      prizeDescription,
      prizeValue,
      endTime,
      maxEntries: maxEntries || 10000,
      winnersCount: winnersCount || 1,
      totalEntries: 0,
      isActive: true,
      winnersSelected: false,
      hostEmail,
      entryUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/enter/${mockSweepstakesId}`,
      verificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${mockSweepstakesId}`,
      feeUsd: totalFee / 100, // Convert cents to dollars
      createdAt: new Date().toISOString(),
    };

    // Store in database (for demo, we'll return the data)
    // In production: await database.sweepstakes.create(sweepstakesData);

    return NextResponse.json({
      success: true,
      sweepstakes: sweepstakesData,
      message: "Sweepstakes created successfully!",
    });
  } catch (error) {
    console.error("Error creating sweepstakes:", error);
    return NextResponse.json(
      { error: "Failed to create sweepstakes" },
      { status: 500 }
    );
  }
}

// GET /api/sweepstakes - List all sweepstakes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Mock data for demo
    const mockSweepstakes = [
      {
        id: "sweepstakes_1",
        title: "Holiday Giveaway 2024",
        description: "Win amazing prizes this holiday season!",
        prizeDescription: 'MacBook Pro 16" + AirPods Pro',
        prizeValue: 299900, // $2999 in cents
        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        maxEntries: 10000,
        winnersCount: 3,
        totalEntries: 1247,
        isActive: true,
        winnersSelected: false,
        hostEmail: "host@example.com",
        entryUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/enter/sweepstakes_1`,
        verificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/sweepstakes_1`,
        feeUsd: 599,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sweepstakes_2",
        title: "Gaming Setup Giveaway",
        description: "Ultimate gaming setup for streamers!",
        prizeDescription: "RTX 4090 + Gaming Chair + Streaming Equipment",
        prizeValue: 499900, // $4999 in cents
        endTime: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days from now
        maxEntries: 5000,
        winnersCount: 1,
        totalEntries: 892,
        isActive: true,
        winnersSelected: false,
        hostEmail: "gamer@example.com",
        entryUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/enter/sweepstakes_2`,
        verificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/sweepstakes_2`,
        feeUsd: 599,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Filter by status if specified
    let filteredSweepstakes = mockSweepstakes;
    if (status === "active") {
      filteredSweepstakes = mockSweepstakes.filter(
        (s) => s.isActive && !s.winnersSelected
      );
    } else if (status === "ended") {
      filteredSweepstakes = mockSweepstakes.filter(
        (s) => !s.isActive || s.winnersSelected
      );
    }

    // Apply pagination
    const paginatedSweepstakes = filteredSweepstakes.slice(
      offset,
      offset + limit
    );

    return NextResponse.json({
      success: true,
      sweepstakes: paginatedSweepstakes,
      total: filteredSweepstakes.length,
      hasMore: offset + limit < filteredSweepstakes.length,
    });
  } catch (error) {
    console.error("Error fetching sweepstakes:", error);
    return NextResponse.json(
      { error: "Failed to fetch sweepstakes" },
      { status: 500 }
    );
  }
}
