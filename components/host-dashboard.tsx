import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";
import {
  Plus,
  BarChart3,
  Users,
  Trophy,
  Eye,
  Settings,
  ExternalLink,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  Copy,
  CheckCircle,
} from "lucide-react";

interface Sweepstakes {
  id: string;
  title: string;
  description: string;
  prizeDescription: string;
  prizeValue: number;
  endTime: number;
  maxEntries: number;
  winnersCount: number;
  totalEntries: number;
  isActive: boolean;
  winnersSelected: boolean;
  hostEmail: string;
  entryUrl: string;
  verificationUrl: string;
  feeUsd: number;
  createdAt: string;
}

interface DashboardStats {
  totalSweepstakes: number;
  activeSweepstakes: number;
  totalEntries: number;
  totalPrizeValue: number;
  conversionRate: number;
  avgEntriesPerDay: number;
}

export function HostDashboard() {
  const [sweepstakes, setSweepstakes] = useState<Sweepstakes[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSweepstakes: 0,
    activeSweepstakes: 0,
    totalEntries: 0,
    totalPrizeValue: 0,
    conversionRate: 0,
    avgEntriesPerDay: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string>("");

  // Fetch sweepstakes data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for demo
        const mockSweepstakes: Sweepstakes[] = [
          {
            id: "sweepstakes_1",
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
            hostEmail: "host@example.com",
            entryUrl: `${window.location.origin}/enter/sweepstakes_1`,
            verificationUrl: `${window.location.origin}/verify/sweepstakes_1`,
            feeUsd: 599,
            createdAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "sweepstakes_2",
            title: "Gaming Setup Giveaway",
            description: "Ultimate gaming setup for streamers!",
            prizeDescription: "RTX 4090 + Gaming Chair + Streaming Equipment",
            prizeValue: 499900,
            endTime: Date.now() + 14 * 24 * 60 * 60 * 1000,
            maxEntries: 5000,
            winnersCount: 1,
            totalEntries: 892,
            isActive: true,
            winnersSelected: false,
            hostEmail: "gamer@example.com",
            entryUrl: `${window.location.origin}/enter/sweepstakes_2`,
            verificationUrl: `${window.location.origin}/verify/sweepstakes_2`,
            feeUsd: 599,
            createdAt: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ];

        setSweepstakes(mockSweepstakes);

        // Calculate stats
        const totalEntries = mockSweepstakes.reduce(
          (sum, s) => sum + s.totalEntries,
          0
        );
        const totalPrizeValue = mockSweepstakes.reduce(
          (sum, s) => sum + s.prizeValue,
          0
        );
        const activeSweepstakes = mockSweepstakes.filter(
          (s) => s.isActive && !s.winnersSelected
        ).length;

        setStats({
          totalSweepstakes: mockSweepstakes.length,
          activeSweepstakes,
          totalEntries,
          totalPrizeValue,
          conversionRate: 12.4, // Mock conversion rate
          avgEntriesPerDay: 156, // Mock average
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(""), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
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

  const getTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;

    if (remaining <= 0) return "Ended";

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
      (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Host Dashboard
              </h1>
              <p className="text-gray-600">Manage your sweepstakes campaigns</p>
            </div>
            <Link href="/create-sweepstakes">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Sweepstakes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Campaigns
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSweepstakes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Entries
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEntries.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prize Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalPrizeValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.conversionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sweepstakes List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Sweepstakes
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {sweepstakes.map((sweepstake) => (
              <div key={sweepstake.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sweepstake.title}
                      </h3>
                      {sweepstake.isActive && !sweepstake.winnersSelected && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                      {sweepstake.winnersSelected && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Completed
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">
                      {sweepstake.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Prize Value</p>
                        <p className="font-semibold">
                          {formatCurrency(sweepstake.prizeValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Entries</p>
                        <p className="font-semibold">
                          {sweepstake.totalEntries.toLocaleString()} /{" "}
                          {sweepstake.maxEntries.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Winners</p>
                        <p className="font-semibold">
                          {sweepstake.winnersCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time Remaining</p>
                        <p className="font-semibold">
                          {getTimeRemaining(sweepstake.endTime)}
                        </p>
                      </div>
                    </div>

                    {/* URLs */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-20">
                          Entry URL:
                        </span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                          {sweepstake.entryUrl}
                        </code>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              sweepstake.entryUrl,
                              `entry-${sweepstake.id}`
                            )
                          }
                          className="flex items-center gap-1"
                        >
                          {copiedUrl === `entry-${sweepstake.id}` ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-20">
                          Verify URL:
                        </span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                          {sweepstake.verificationUrl}
                        </code>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              sweepstake.verificationUrl,
                              `verify-${sweepstake.id}`
                            )
                          }
                          className="flex items-center gap-1"
                        >
                          {copiedUrl === `verify-${sweepstake.id}` ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <Link href={sweepstake.entryUrl} target="_blank">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    </Link>
                    <Link href={sweepstake.verificationUrl} target="_blank">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Shield className="w-4 h-4" />
                        Verify
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Manage
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Entry Progress</span>
                    <span>
                      {(
                        (sweepstake.totalEntries / sweepstake.maxEntries) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((sweepstake.totalEntries / sweepstake.maxEntries) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sweepstakes.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sweepstakes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first sweepstakes to get started!
              </p>
              <Link href="/create-sweepstakes">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Sweepstakes
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Platform Benefits */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Provably Fair Technology
              </h3>
              <p className="text-gray-600 mb-4">
                Your sweepstakes use blockchain-verified randomness, ensuring
                participants can trust the winner selection process. This
                transparency leads to higher participation rates and better
                brand reputation.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Blockchain verified
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Public verification
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Higher trust = More entries
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
