import { GovernancePanel } from "@/components/governance-panel";

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Platform Governance
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Participate in platform governance by staking SWEEP tokens, voting
              on disputes, and helping maintain the integrity of our sweepstakes
              ecosystem.
            </p>
          </div>

          {/* Governance Panel */}
          <GovernancePanel />
        </div>
      </div>
    </div>
  );
}
