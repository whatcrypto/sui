"use client";
import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import { 
  getActiveSweepstakes, 
  getHostSweepstakes, 
  getParticipantEntries 
} from "../lib/smart-contract/index.js";

export default function Home() {
  const account = useCurrentAccount();
  const [stats, setStats] = useState({
    activeSweepstakes: 0,
    hostedSweepstakes: 0,
    enteredSweepstakes: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, [account]);

  const loadStats = async () => {
    setStats(prev => ({ ...prev, loading: true }));
    try {
      const active = await getActiveSweepstakes();
      let hosted = [];
      let entered = [];
      
      if (account) {
        [hosted, entered] = await Promise.all([
          getHostSweepstakes(account.address),
          getParticipantEntries(account.address)
        ]);
      }
      
      setStats({
        activeSweepstakes: active.length,
        hostedSweepstakes: hosted.length,
        enteredSweepstakes: entered.length,
        loading: false
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Sweepstakes Platform</h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Connect your wallet to participate in sweepstakes, create your own, and win amazing prizes on the Sui blockchain
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-white font-semibold mb-2">Browse & Enter</h3>
                <p className="text-slate-400 text-sm">Discover active sweepstakes and enter for free</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-3">➕</div>
                <h3 className="text-white font-semibold mb-2">Create & Host</h3>
                <p className="text-slate-400 text-sm">Host your own sweepstakes and engage your community</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="text-white font-semibold mb-2">Win Prizes</h3>
                <p className="text-slate-400 text-sm">Fair blockchain-based winner selection</p>
              </div>
            </div>
            <p className="text-slate-500 text-lg">Please connect your wallet to continue</p>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400">Welcome back to the sweepstakes platform</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Connected as</p>
              <p className="text-white font-mono text-sm">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎲</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {stats.loading ? "..." : stats.activeSweepstakes}
                </p>
                <p className="text-emerald-400 text-sm font-medium">Active</p>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">Active Sweepstakes</h3>
            <p className="text-slate-400 text-sm">Available to enter now</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {stats.loading ? "..." : stats.hostedSweepstakes}
                </p>
                <p className="text-yellow-400 text-sm font-medium">Hosted</p>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">My Hosted</h3>
            <p className="text-slate-400 text-sm">Sweepstakes you created</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎫</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {stats.loading ? "..." : stats.enteredSweepstakes}
                </p>
                <p className="text-cyan-400 text-sm font-medium">Entered</p>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">My Entries</h3>
            <p className="text-slate-400 text-sm">Sweepstakes you entered</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/browse"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-4 rounded-lg transition-all duration-200 text-center group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔍</div>
              <h3 className="font-semibold mb-1">Browse</h3>
              <p className="text-sm opacity-90">Find active sweepstakes</p>
            </Link>
            
            <Link 
              href="/create"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-4 rounded-lg transition-all duration-200 text-center group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</div>
              <h3 className="font-semibold mb-1">Create</h3>
              <p className="text-sm opacity-90">Host new sweepstakes</p>
            </Link>
            
            <Link 
              href="/hosted"
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white p-4 rounded-lg transition-all duration-200 text-center group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏆</div>
              <h3 className="font-semibold mb-1">Manage</h3>
              <p className="text-sm opacity-90">Your hosted sweepstakes</p>
            </Link>
            
            <Link 
              href="/entries"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white p-4 rounded-lg transition-all duration-200 text-center group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎫</div>
              <h3 className="font-semibold mb-1">Track</h3>
              <p className="text-sm opacity-90">Your entries</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-semibold">Recent Activity</h2>
            <button 
              onClick={loadStats}
              disabled={stats.loading}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {stats.loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-slate-400 mb-4">Activity tracking coming soon</p>
            <p className="text-slate-500 text-sm">Check individual pages for detailed information</p>
          </div>
        </div>
      </div>
    </div>
  );
}