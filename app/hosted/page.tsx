"use client";
import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import Link from "next/link";
import { 
  getHostSweepstakes, 
  selectWinner, 
  submitProofOfDelivery 
} from "../../lib/smart-contract/index.js";
import { SweepstakesCard } from "../../components/SweepstakesCard.jsx";

export default function HostedPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [hostedSweepstakes, setHostedSweepstakes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      loadHostedSweepstakes();
    }
  }, [account]);

  const loadHostedSweepstakes = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const hosted = await getHostSweepstakes(account.address);
      setHostedSweepstakes(hosted);
    } catch (error) {
      console.error("Failed to load hosted sweepstakes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinner = async (sweepstakesId) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const transaction = await selectWinner(sweepstakesId);
      
      signAndExecute(
        { transaction },
        {
          onSuccess: () => {
            console.log("Winner selected successfully!");
            loadHostedSweepstakes();
          },
          onError: (error) => {
            console.error("Failed to select winner:", error);
            alert("Failed to select winner. Check console for details.");
          },
        }
      );
    } catch (error) {
      console.error("Error selecting winner:", error);
      alert("Error selecting winner. Check console for details.");
    }
  };

  const handleSubmitProof = async (sweepstakesId, proofData) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const transaction = await submitProofOfDelivery(sweepstakesId, proofData);
      
      signAndExecute(
        { transaction },
        {
          onSuccess: () => {
            console.log("Proof of delivery submitted successfully!");
            loadHostedSweepstakes();
          },
          onError: (error) => {
            console.error("Failed to submit proof:", error);
            alert("Failed to submit proof. Check console for details.");
          },
        }
      );
    } catch (error) {
      console.error("Error submitting proof:", error);
      alert("Error submitting proof. Check console for details.");
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🏆</span>
            </div>
            <h1 className="text-white text-2xl font-bold mb-4">My Hosted Sweepstakes</h1>
            <p className="text-slate-400 mb-6">Connect your wallet to view and manage your hosted sweepstakes</p>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Hosted Sweepstakes</h1>
              <p className="text-slate-400">Manage your sweepstakes and select winners</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/create"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                Create New
              </Link>
              <Link 
                href="/"
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            </div>
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
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <span>➕</span>
              <span>Create</span>
            </Link>
            <Link 
              href="/hosted"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
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

        {/* Content */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">My Hosted Sweepstakes</h2>
            <button
              onClick={loadHostedSweepstakes}
              disabled={loading}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
              <span className="ml-3 text-slate-400">Loading your sweepstakes...</span>
            </div>
          ) : hostedSweepstakes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-white text-xl font-semibold mb-2">No Hosted Sweepstakes</h3>
              <p className="text-slate-400 mb-6">You haven't hosted any sweepstakes yet. Create your first one!</p>
              <Link 
                href="/create"
                className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Create Sweepstakes
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {hostedSweepstakes.map((sweepstake) => (
                <SweepstakesCard
                  key={sweepstake.id}
                  sweepstake={sweepstake}
                  onSelectWinner={handleSelectWinner}
                  onSubmitProof={handleSubmitProof}
                  showHostActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}