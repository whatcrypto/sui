"use client";
import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSweepstakes } from "../../lib/smart-contract/index.js";

export default function CreatePage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const router = useRouter();
  
  const [creating, setCreating] = useState(false);
  const [newSweepstakes, setNewSweepstakes] = useState({
    title: "",
    description: "",
    prizeAmount: 0,
    maxParticipants: 100,
    endTimestamp: "",
    deliveryInfo: "",
  });

  const handleCreateSweepstakes = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (
      !newSweepstakes.title ||
      !newSweepstakes.description ||
      newSweepstakes.prizeAmount <= 0 ||
      !newSweepstakes.endTimestamp
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const endTimestampMs = new Date(newSweepstakes.endTimestamp).getTime();
      
      const transaction = await createSweepstakes(
        newSweepstakes.title,
        newSweepstakes.description,
        newSweepstakes.prizeAmount * 1000000000,
        newSweepstakes.maxParticipants,
        endTimestampMs,
        newSweepstakes.deliveryInfo
      );

      signAndExecute(
        { transaction },
        {
          onSuccess: () => {
            console.log("Sweepstakes created successfully!");
            setNewSweepstakes({
              title: "",
              description: "",
              prizeAmount: 0,
              maxParticipants: 100,
              endTimestamp: "",
              deliveryInfo: "",
            });
            router.push("/hosted");
          },
          onError: (error) => {
            console.error("Failed to create sweepstakes:", error);
            alert("Failed to create sweepstakes. Check console for details.");
          },
        }
      );
    } catch (error) {
      console.error("Error creating sweepstakes:", error);
      alert("Error creating sweepstakes. Check console for details.");
    } finally {
      setCreating(false);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">➕</span>
            </div>
            <h1 className="text-white text-2xl font-bold mb-4">Create Sweepstakes</h1>
            <p className="text-slate-400 mb-6">Connect your wallet to create and host sweepstakes</p>
            <Link 
              href="/"
              className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Sweepstakes</h1>
              <p className="text-slate-400">Host your own sweepstakes and engage your community</p>
            </div>
            <Link 
              href="/"
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-1 mb-6">
          <div className="flex space-x-1">
            <Link 
              href="/browse"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <span>🔍</span>
              <span>Browse</span>
            </Link>
            <Link 
              href="/create"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
            >
              <span>➕</span>
              <span>Create</span>
            </Link>
            <Link 
              href="/hosted"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <span>🏆</span>
              <span>My Hosted</span>
            </Link>
            <Link 
              href="/entries"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <span>🎫</span>
              <span>My Entries</span>
            </Link>
          </div>
        </div>

        {/* Create Form */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-white text-xl font-semibold mb-6">Create New Sweepstakes</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newSweepstakes.title}
                onChange={(e) =>
                  setNewSweepstakes({ ...newSweepstakes, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="Enter sweepstakes title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                value={newSweepstakes.description}
                onChange={(e) =>
                  setNewSweepstakes({
                    ...newSweepstakes,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                placeholder="Describe your sweepstakes and prize"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prize Amount (SWEEP) *
                </label>
                <input
                  type="number"
                  value={newSweepstakes.prizeAmount}
                  onChange={(e) =>
                    setNewSweepstakes({
                      ...newSweepstakes,
                      prizeAmount: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="0.0"
                  step="0.1"
                  min="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={newSweepstakes.maxParticipants}
                  onChange={(e) =>
                    setNewSweepstakes({
                      ...newSweepstakes,
                      maxParticipants: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="100"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={newSweepstakes.endTimestamp}
                onChange={(e) =>
                  setNewSweepstakes({
                    ...newSweepstakes,
                    endTimestamp: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                min={minDate}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Delivery Information
              </label>
              <textarea
                value={newSweepstakes.deliveryInfo}
                onChange={(e) =>
                  setNewSweepstakes({
                    ...newSweepstakes,
                    deliveryInfo: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                placeholder="How will the prize be delivered? (optional)"
                rows={3}
              />
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
              <h3 className="text-cyan-400 font-semibold mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Important Notes
              </h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  You'll need to deposit collateral (prize amount + platform fee)
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  Participants enter for free - you cover all costs
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  Winner selection uses blockchain randomness for fairness
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  You have 7 days to deliver the prize after winner selection
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Link
                href="/browse"
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 text-center"
              >
                Cancel
              </Link>
              <button
                onClick={handleCreateSweepstakes}
                disabled={
                  creating ||
                  !newSweepstakes.title ||
                  !newSweepstakes.description ||
                  newSweepstakes.prizeAmount <= 0 ||
                  !newSweepstakes.endTimestamp
                }
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
              >
                {creating ? "Creating..." : "Create Sweepstakes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}