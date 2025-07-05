import { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  CheckCircle,
  Users,
  Trophy,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Button } from "@/components/Button";

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    entry?: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: "Verify Sweepstakes - SweepChain",
    description:
      "Verify the fairness and transparency of this blockchain-powered sweepstakes",
    openGraph: {
      title: "Verify Sweepstakes - SweepChain",
      description:
        "Verify the fairness and transparency of this blockchain-powered sweepstakes",
      type: "website",
    },
  };
}

export default async function VerifySweepstakesPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = params;
  const { entry } = searchParams;

  // Mock data - in production, fetch from blockchain and database
  const sweepstakesData = {
    id,
    title: "Holiday Giveaway 2024",
    description: "Win amazing prizes this holiday season!",
    prizeDescription: 'MacBook Pro 16" + AirPods Pro',
    prizeValue: 299900,
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    totalEntries: 1247,
    winnersCount: 3,
    isActive: true,
    winnersSelected: false,
    blockchainTx: "0x1234567890abcdef1234567890abcdef12345678",
    randomSeed: "0xabcdef1234567890abcdef1234567890abcdef12",
    entries: Array.from({ length: 1247 }, (_, i) => ({
      id: `ENT-${Date.now() - i * 1000}-${Math.random().toString(36).substr(2, 9)}`,
      entryNumber: i + 1,
      participantHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: Date.now() - i * 60000,
      nftId: `nft_entry_${i + 1}`,
    })),
  };

  const specificEntry = entry
    ? sweepstakesData.entries.find((e) => e.id === entry)
    : null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Provably Fair Verification
              </h1>
              <p className="text-gray-600">
                Blockchain-verified sweepstakes transparency
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sweepstakes Info */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {sweepstakesData.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {sweepstakesData.totalEntries.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {sweepstakesData.winnersCount}
                </p>
                <p className="text-sm text-gray-600">Winners</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-sm text-gray-600">Verifiable</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Prize Details
              </h3>
              <p className="text-gray-600 mb-2">
                {sweepstakesData.prizeDescription}
              </p>
              <p className="text-lg font-semibold text-green-600">
                Total Value: $
                {(sweepstakesData.prizeValue / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Specific Entry Verification */}
        {specificEntry && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Entry Verification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Entry ID</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {specificEntry.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entry Number</p>
                  <p className="font-semibold">#{specificEntry.entryNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">NFT ID</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {specificEntry.nftId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entry Time</p>
                  <p className="font-semibold">
                    {formatDate(specificEntry.timestamp)}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Entry Verified
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  This entry has been verified on the blockchain and is eligible
                  for the drawing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Verification */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Blockchain Verification
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Smart Contract Address
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 p-2 rounded flex-1 font-mono">
                    0x1234567890abcdef1234567890abcdef12345678
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        "0x1234567890abcdef1234567890abcdef12345678"
                      )
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Creation Transaction
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 p-2 rounded flex-1 font-mono">
                    {sweepstakesData.blockchainTx}
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(sweepstakesData.blockchainTx)
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Link
                    href={`https://suiexplorer.com/txblock/${sweepstakesData.blockchainTx}?network=testnet`}
                    target="_blank"
                  >
                    <Button variant="secondary" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {sweepstakesData.winnersSelected && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Random Seed (for winner selection)
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 p-2 rounded flex-1 font-mono">
                      {sweepstakesData.randomSeed}
                    </code>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(sweepstakesData.randomSeed)
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                How to Verify
              </h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>
                  1. Click the transaction link above to view on Sui Explorer
                </li>
                <li>
                  2. Verify the smart contract code is published and immutable
                </li>
                <li>3. Check that all entries are recorded on-chain</li>
                <li>4. Confirm winner selection uses blockchain randomness</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Entry List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Entries
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entry #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entry ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NFT ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sweepstakesData.entries.slice(0, 10).map((entry) => (
                    <tr
                      key={entry.id}
                      className={
                        entry.id === specificEntry?.id ? "bg-green-50" : ""
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{entry.entryNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {entry.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(entry.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {entry.nftId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sweepstakesData.entries.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 10 of {sweepstakesData.entries.length} entries.
                  <Link
                    href="#"
                    className="text-blue-600 hover:text-blue-500 ml-1"
                  >
                    View all entries
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why This is Trustworthy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  Blockchain Verified
                </p>
                <p className="text-sm text-gray-600">
                  All entries recorded immutably on Sui blockchain
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  Provable Randomness
                </p>
                <p className="text-sm text-gray-600">
                  Winner selection uses cryptographic randomness
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  Public Verification
                </p>
                <p className="text-sm text-gray-600">
                  Anyone can verify the fairness independently
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
