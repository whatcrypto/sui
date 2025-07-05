"use client";
import { SweepstakesCard } from "./SweepstakesCard.jsx";

export function HostedSweepstakes({
  sweepstakes,
  loading,
  onSelectWinner,
  onSubmitProof,
  onRefresh,
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">
          My Hosted Sweepstakes
        </h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-slate-400">
            Loading your sweepstakes...
          </span>
        </div>
      ) : sweepstakes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-slate-400 mb-2">
            You haven't hosted any sweepstakes yet
          </p>
          <p className="text-slate-500 text-sm">
            Click the "Create" tab to host your first sweepstakes!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sweepstakes.map((sweepstake) => (
            <SweepstakesCard
              key={sweepstake.id}
              sweepstake={sweepstake}
              onSelectWinner={onSelectWinner}
              onSubmitProof={onSubmitProof}
              showHostActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}