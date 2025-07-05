"use client";

import React, { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  Trophy,
  Ticket,
  Users,
  Clock,
  DollarSign,
  Plus,
  Send,
  Gift,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import { GovernancePanel } from "@/components/governance-panel";

interface SweepstakesForm {
  title: string;
  description: string;
  prizeAmount: string;
  ticketCount: string;
  endDate: string;
}

interface Sweepstakes {
  id: string;
  title: string;
  description: string;
  prizeAmount: number;
  ticketCount: number;
  ticketsDistributed: number;
  participants: number;
  endDate: Date;
  status: "active" | "ended" | "winner_selected";
  host: string;
}

interface Entry {
  sweepstakesId: string;
  title: string;
  description: string;
  prizeAmount: number;
  ticketCount: number;
  totalEntries: number;
  drawDate: Date;
}

export default function SweepstakesPage() {
  const [activeTab, setActiveTab] = useState<
    "host" | "my-sweepstakes" | "entered" | "governance"
  >("host");
  const [form, setForm] = useState<SweepstakesForm>({
    title: "",
    description: "",
    prizeAmount: "",
    ticketCount: "",
    endDate: "",
  });

  // Dynamic state for sweepstakes data
  const [mySweepstakes, setMySweepstakes] = useState<Sweepstakes[]>([]);
  const [myEntries, setMyEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const router = useRouter();

  // Handle URL hash navigation
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "host") setActiveTab("host");
    else if (hash === "my-sweepstakes") setActiveTab("my-sweepstakes");
    else if (hash === "entered") setActiveTab("entered");
    else if (hash === "governance") setActiveTab("governance");
  }, []);

  const handleCreateSweepstakes = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    setLoading(true);
    try {
      // Calculate collateral (prize amount + 10% fee)
      const collateral = parseFloat(form.prizeAmount) * 1.1;

      // TODO: Create actual transaction
      const tx = new Transaction();
      // Add your sweepstakes creation logic here

      // For now, just add to local state (replace with actual blockchain interaction)
      const newSweepstakes: Sweepstakes = {
        id: `sweep_${Date.now()}`,
        title: form.title,
        description: form.description,
        prizeAmount: parseFloat(form.prizeAmount),
        ticketCount: parseInt(form.ticketCount),
        ticketsDistributed: 0,
        participants: 0,
        endDate: new Date(form.endDate),
        status: "active",
        host: account.address,
      };

      setMySweepstakes([...mySweepstakes, newSweepstakes]);

      // Reset form
      setForm({
        title: "",
        description: "",
        prizeAmount: "",
        ticketCount: "",
        endDate: "",
      });

      // Switch to my sweepstakes tab
      setActiveTab("my-sweepstakes");
    } catch (error) {
      console.error("Error creating sweepstakes:", error);
      alert("Failed to create sweepstakes");
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diff < 0) return "Ended";
    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Sweepstakes Platform
          </h1>
          <p className="text-slate-400">
            Create sweepstakes, distribute tickets, win prizes
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-lg p-1 inline-flex gap-1">
            <Button
              onClick={() => {
                setActiveTab("host");
                window.location.hash = "host";
              }}
              variant={activeTab === "host" ? "primary" : "ghost"}
              size="md"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Host Sweepstakes
            </Button>
            <Button
              onClick={() => {
                setActiveTab("my-sweepstakes");
                window.location.hash = "my-sweepstakes";
              }}
              variant={activeTab === "my-sweepstakes" ? "primary" : "ghost"}
              size="md"
              className="gap-2"
            >
              <Trophy className="w-4 h-4" />
              My Sweepstakes
            </Button>
            <Button
              onClick={() => {
                setActiveTab("entered");
                window.location.hash = "entered";
              }}
              variant={activeTab === "entered" ? "primary" : "ghost"}
              size="md"
              className="gap-2"
            >
              <Ticket className="w-4 h-4" />
              My Entries
            </Button>
            <Button
              onClick={() => {
                setActiveTab("governance");
                window.location.hash = "governance";
              }}
              variant={activeTab === "governance" ? "primary" : "ghost"}
              size="md"
              className="gap-2"
            >
              <Gavel className="w-4 h-4" />
              Governance
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === "host" && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Create New Sweepstakes
              </h2>

              <form onSubmit={handleCreateSweepstakes} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sweepstakes Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="Amazing Prize Giveaway"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="Describe your sweepstakes and prizes..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Prize Amount ($SWEEP)
                    </label>
                    <input
                      type="number"
                      value={form.prizeAmount}
                      onChange={(e) =>
                        setForm({ ...form, prizeAmount: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder="1000"
                      min="1"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Number of Entry Tickets
                    </label>
                    <input
                      type="number"
                      value={form.ticketCount}
                      onChange={(e) =>
                        setForm({ ...form, ticketCount: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Collateral Info */}
                <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
                  <h3 className="text-cyan-400 font-semibold mb-3">
                    Collateral Required
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prize Amount:</span>
                      <span className="text-white font-mono">
                        {form.prizeAmount || "0"} $SWEEP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Platform Fee (10%):
                      </span>
                      <span className="text-white font-mono">
                        {form.prizeAmount
                          ? (parseFloat(form.prizeAmount) * 0.1).toFixed(1)
                          : "0"}{" "}
                        $SWEEP
                      </span>
                    </div>
                    <div className="border-t border-slate-700 pt-2 flex justify-between">
                      <span className="text-slate-300 font-medium">
                        Total Collateral:
                      </span>
                      <span className="text-cyan-400 font-mono font-semibold">
                        {form.prizeAmount
                          ? (parseFloat(form.prizeAmount) * 1.1).toFixed(1)
                          : "0"}{" "}
                        $SWEEP
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading
                    ? "Creating..."
                    : "Create Sweepstakes & Generate Tickets"}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "my-sweepstakes" && (
            <div className="space-y-6">
              {mySweepstakes.length > 0 ? (
                mySweepstakes.map((sweepstakes) => (
                  <div
                    key={sweepstakes.id}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {sweepstakes.title}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {sweepstakes.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          sweepstakes.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {sweepstakes.status === "active" ? "Active" : "Ended"}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <DollarSign className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                        <p className="text-sm text-slate-400">Prize</p>
                        <p className="font-semibold text-white">
                          {sweepstakes.prizeAmount} $SWEEP
                        </p>
                      </div>
                      <div className="text-center">
                        <Ticket className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                        <p className="text-sm text-slate-400">Tickets</p>
                        <p className="font-semibold text-white">
                          {sweepstakes.ticketsDistributed}/
                          {sweepstakes.ticketCount}
                        </p>
                      </div>
                      <div className="text-center">
                        <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                        <p className="text-sm text-slate-400">Participants</p>
                        <p className="font-semibold text-white">
                          {sweepstakes.participants}
                        </p>
                      </div>
                      <div className="text-center">
                        <Clock className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                        <p className="text-sm text-slate-400">Ends In</p>
                        <p className="font-semibold text-white">
                          {calculateTimeLeft(sweepstakes.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button variant="secondary" className="flex-1 gap-2">
                        <Send className="w-4 h-4" />
                        Send Tickets
                      </Button>
                      <Button variant="primary" className="flex-1">
                        Draw Winner
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-12 text-center">
                  <Gift className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Active Sweepstakes
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Create your first sweepstakes to start distributing tickets!
                  </p>
                  <Button
                    onClick={() => setActiveTab("host")}
                    variant="primary"
                    size="lg"
                  >
                    Create Sweepstakes
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "entered" && (
            <div className="space-y-6">
              {myEntries.length > 0 ? (
                myEntries.map((entry) => (
                  <div
                    key={entry.sweepstakesId}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {entry.title}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {entry.description}
                        </p>
                      </div>
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                        {entry.ticketCount} Tickets
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Prize Value</p>
                        <p className="font-semibold text-white">
                          {entry.prizeAmount} $SWEEP
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Total Entries</p>
                        <p className="font-semibold text-white">
                          {entry.totalEntries}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Draw Date</p>
                        <p className="font-semibold text-white">
                          {entry.drawDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-12 text-center">
                  <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Entries Yet
                  </h3>
                  <p className="text-slate-400">
                    Get tickets from sweepstakes hosts to participate!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "governance" && <GovernancePanel />}
        </div>
      </div>
    </div>
  );
}
