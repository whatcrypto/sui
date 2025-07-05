"use client";
import { useState } from "react";
import { formatSweepAmount, formatTimestamp, getSweepstakesStatus, Sweepstakes } from "../lib/smart-contract";

interface SweepstakesCardProps {
  sweepstake: Sweepstakes;
  onEnter?: (sweepstakesId: string) => void;
  onSelectWinner?: (sweepstakesId: string) => void;
  onSubmitProof?: (sweepstakesId: string, proofData: string) => void;
  showEnterButton?: boolean;
  showHostActions?: boolean;
  showEntryInfo?: boolean;
  userAddress?: string;
}

export function SweepstakesCard({
  sweepstake,
  onEnter,
  onSelectWinner,
  onSubmitProof,
  showEnterButton = false,
  showHostActions = false,
  showEntryInfo = false,
  userAddress,
}: SweepstakesCardProps) {
  const [submittingProof, setSubmittingProof] = useState<boolean>(false);
  const [proofData, setProofData] = useState<string>("");

  const handleSubmitProof = async (): Promise<void> => {
    if (!proofData.trim()) {
      alert("Please enter proof of delivery");
      return;
    }
    setSubmittingProof(true);
    try {
      if (onSubmitProof) {
        await onSubmitProof(sweepstake.id, proofData);
      }
      setProofData("");
    } finally {
      setSubmittingProof(false);
    }
  };

  const status = getSweepstakesStatus(sweepstake.status);
  const isEnded = new Date(sweepstake.endTimestamp) < new Date();
  const canSelectWinner =
    showHostActions &&
    status === "ACTIVE" &&
    isEnded &&
    sweepstake.participantCount > 0;

  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-medium text-lg">{sweepstake.title}</h4>
          <p className="text-slate-400 text-sm mt-1">
            {sweepstake.description}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              status === "ACTIVE" && !isEnded
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : status === "WINNER_SELECTED"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : status === "COMPLETED"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {status === "ACTIVE" && !isEnded
              ? "Active"
              : status === "ACTIVE" && isEnded
              ? "Ended"
              : status === "WINNER_SELECTED"
              ? "Winner Selected"
              : status === "COMPLETED"
              ? "Completed"
              : "Inactive"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-slate-500 text-xs">Prize</p>
          <p className="text-cyan-400 font-mono text-sm">
            {formatSweepAmount(sweepstake.prizeAmount)} SWEEP
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Participants</p>
          <p className="text-white text-sm">
            {sweepstake.participantCount}/{sweepstake.maxParticipants}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Ends</p>
          <p className="text-white text-sm">
            {formatTimestamp(sweepstake.endTimestamp)}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Host</p>
          <p className="text-white text-sm font-mono">
            {sweepstake.host.slice(0, 6)}...{sweepstake.host.slice(-4)}
          </p>
        </div>
      </div>

      {sweepstake.winner && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">🏆</span>
            <span className="text-white font-medium">
              Winner: {sweepstake.winner.slice(0, 6)}...
              {sweepstake.winner.slice(-4)}
            </span>
          </div>
        </div>
      )}

      {showEntryInfo && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400">🎫</span>
            <span className="text-white">You entered this sweepstakes</span>
            {sweepstake.winner === userAddress && (
              <span className="text-yellow-400 font-medium">🎉 You won!</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {showEnterButton && status === "ACTIVE" && !isEnded && (
          <button
            onClick={() => onEnter && onEnter(sweepstake.id)}
            disabled={sweepstake.participantCount >= sweepstake.maxParticipants}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-md text-sm transition-all duration-200 font-medium"
          >
            {sweepstake.participantCount >= sweepstake.maxParticipants
              ? "Full"
              : "Enter Free"}
          </button>
        )}

        {canSelectWinner && (
          <button
            onClick={() => onSelectWinner && onSelectWinner(sweepstake.id)}
            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-md text-sm transition-all duration-200 font-medium"
          >
            Select Winner
          </button>
        )}

        {showHostActions && status === "WINNER_SELECTED" && (
          <div className="flex items-center space-x-2 flex-1">
            <input
              type="text"
              value={proofData}
              onChange={(e) => setProofData(e.target.value)}
              placeholder="Enter proof of delivery (tracking number, etc.)"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSubmitProof}
              disabled={submittingProof || !proofData.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-md text-sm transition-all duration-200 font-medium"
            >
              {submittingProof ? "Submitting..." : "Submit Proof"}
            </button>
          </div>
        )}
      </div>

      {sweepstake.deliveryInfo && (
        <div className="mt-3 text-slate-400 text-sm">
          <p className="font-medium">Delivery Info:</p>
          <p>{sweepstake.deliveryInfo}</p>
        </div>
      )}
    </div>
  );
}