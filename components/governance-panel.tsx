"use client";
import { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import {
  castGovernanceVote,
  claimVotingRewards,
  stakeSweepTokens,
  getGovernanceVoteInfo,
  getVoterRecord,
  hasVotingRights,
  getPlatformInfo,
  createDispute,
  submitDisputeProof,
  getDisputeInfo,
  formatSweepAmount,
  formatTimestamp,
  getDisputeStatus,
  getGovernanceVoteStatus,
} from "@/lib/smart-contract/index";

// TypeScript interfaces
interface DisputeData {
  id: string;
  sweepstakesId: string;
  reason: string;
  evidence?: string;
  status: number;
  createdAt: number;
  disputant: string;
}

interface VoteData {
  id: string;
  title: string;
  description: string;
  endTime: number;
  status: number;
  voteOptions: string[];
  votes: Record<string, number>;
  totalVotes: number;
}

interface PlatformInfo {
  minimumStake: number;
  totalStaked: number;
  platformFeeRate: number;
  votingPeriodMs: number;
  disputePeriodMs: number;
  stakedAmount: number;
}

interface VoterRecord {
  stakedAmount: number;
  votingPower: number;
  rewardsEarned: number;
  lastVoteTime: number;
}

interface DisputeForm {
  sweepstakesId: string;
  reason: string;
  evidence: string;
}

interface DisputesTabProps {
  disputes: DisputeData[];
  disputeForm: DisputeForm;
  setDisputeForm: (form: DisputeForm) => void;
  onCreateDispute: () => void;
  loading: boolean;
}

interface VotingTabProps {
  votes: VoteData[];
  userVotingRights: boolean;
  onCastVote: (voteId: string, choice: string) => void;
  loading: boolean;
}

interface StakingTabProps {
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  userStakeAmount: number;
  platformInfo: PlatformInfo | null;
  onStake: () => void;
  loading: boolean;
}

interface DisputeCardProps {
  dispute: DisputeData;
}

interface VoteCardProps {
  vote: VoteData;
  canVote: boolean;
  onVote: (voteId: string, choice: string) => void;
}

export function GovernancePanel() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // State management
  const [activeTab, setActiveTab] = useState<"disputes" | "voting" | "staking">(
    "disputes"
  );
  const [activeDisputes, setActiveDisputes] = useState<DisputeData[]>([]);
  const [activeVotes, setActiveVotes] = useState<VoteData[]>([]);
  const [userVotingRights, setUserVotingRights] = useState<boolean>(false);
  const [userStakeAmount, setUserStakeAmount] = useState<number>(0);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [disputeForm, setDisputeForm] = useState<DisputeForm>({
    sweepstakesId: "",
    reason: "",
    evidence: "",
  });

  // Load data on component mount and account change
  useEffect(() => {
    if (account) {
      loadGovernanceData();
    }
  }, [account]);

  const loadGovernanceData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Load platform info
      const platformData = await getPlatformInfo();
      // Only set platform info if data is valid and contains all required fields
      if (
        platformData &&
        "totalStaked" in platformData &&
        "platformFeeRate" in platformData &&
        "minimumStakeForVoting" in platformData &&
        "admin" in platformData
      ) {
        // Convert the platform data to match our PlatformInfo interface
        const convertedPlatformInfo: PlatformInfo = {
          totalStaked: parseFloat(platformData.totalStaked),
          platformFeeRate: parseFloat(platformData.platformFeeRate),
          minimumStake: parseFloat(platformData.minimumStakeForVoting),
          votingPeriodMs: 7 * 24 * 60 * 60 * 1000, // Default to 7 days
          disputePeriodMs: 3 * 24 * 60 * 60 * 1000, // Default to 3 days
          stakedAmount: 0,
        };
        setPlatformInfo(convertedPlatformInfo);
      }

      // Load user voting rights and stake
      if (account?.address) {
        const votingRights = await hasVotingRights(account.address);
        setUserVotingRights(votingRights);

        if (votingRights) {
          const voterRecord = await getVoterRecord(
            account.address,
            true as any
          );
          setUserStakeAmount(voterRecord as any);
          stakeSweepTokens(voterRecord as any);
          claimVotingRewards(voterRecord as any);

          const voteInfo = await getGovernanceVoteInfo(voterRecord as any);
          setActiveVotes(voteInfo as any);

          const disputeInfo = await getDisputeInfo(voterRecord as any);
          setActiveDisputes(disputeInfo as any);
        }
      }

      // Load active disputes (mock data - replace with actual query)
      // const disputes = await getActiveDisputes()
      // setActiveDisputes(disputes)

      // Load active governance votes (mock data - replace with actual query)
      // const votes = await getActiveGovernanceVotes()
      // setActiveVotes(votes)
    } catch (error) {
      console.error("Failed to load governance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStakeTokens = async (): Promise<void> => {
    if (!account || !stakeAmount) {
      alert("Please enter a stake amount");
      return;
    }

    try {
      const stakeAmountInBaseUnits = parseFloat(stakeAmount) * 1000000000; // Convert to base units
      const transaction = await stakeSweepTokens(stakeAmountInBaseUnits);

      signAndExecute(
        { transaction },
        {
          onSuccess: () => {
            console.log("Tokens staked successfully!");
            setStakeAmount("");
            loadGovernanceData(); // Refresh data
          },
          onError: (error) => {
            console.error("Failed to stake tokens:", error);
            alert("Failed to stake tokens. Check console for details.");
          },
        }
      );
    } catch (error) {
      console.error("Error staking tokens:", error);
      alert("Error staking tokens. Check console for details.");
    }
  };

  const handleCreateDispute = async (): Promise<void> => {
    if (!account || !disputeForm.sweepstakesId || !disputeForm.reason) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const transaction = await createDispute(
        disputeForm.sweepstakesId,
        disputeForm.reason,
        disputeForm.evidence
      );

      signAndExecute(
        { transaction },
        {
          onSuccess: () => {
            console.log("Dispute created successfully!");
            setDisputeForm({ sweepstakesId: "", reason: "", evidence: "" });
            loadGovernanceData(); // Refresh data
          },
          onError: (error) => {
            console.error("Failed to create dispute:", error);
            alert("Failed to create dispute. Check console for details.");
          },
        }
      );
    } catch (error) {
      console.error("Error creating dispute:", error);
      alert("Error creating dispute. Check console for details.");
    }
  };

  const handleCastVote = async (
    voteId: string,
    voteChoice: string
  ): Promise<void> => {
    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    try {
      const transaction = await castGovernanceVote(voteId, voteChoice as any);

      signAndExecute(
        { transaction },
        {
          onSuccess: () => {
            console.log("Vote cast successfully!");
            loadGovernanceData(); // Refresh data
          },
          onError: (error) => {
            console.error("Failed to cast vote:", error);
            alert("Failed to cast vote. Check console for details.");
          },
        }
      );
    } catch (error) {
      console.error("Error casting vote:", error);
      alert("Error casting vote. Check console for details.");
    }
  };

  const handleClaimRewards = async (): Promise<void> => {
    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    try {
      const transaction = await claimVotingRewards(account.address as any);

      signAndExecute(
        { transaction },
        {
          onSuccess: () => {
            console.log("Rewards claimed successfully!");
            loadGovernanceData(); // Refresh data
          },
          onError: (error) => {
            console.error("Failed to claim rewards:", error);
            alert("Failed to claim rewards. Check console for details.");
          },
        }
      );
    } catch (error) {
      console.error("Error claiming rewards:", error);
      alert("Error claiming rewards. Check console for details.");
    }
  };

  if (!account) {
    return (
      <div className="bg-background ">
        <div className="text-center">
          <div className="w-16 h-16 background rounded-full flex items-center justify-center mx-auto text-white text-4xl mb-4">
            <span className="text-4xl">🏛️</span>
          </div>
          <h3 className="text-white text-2xl font-semibold mb-2">Governance</h3>
          <p className="text-slate-400 mb-4">
            Connect your wallet to participate in platform governance!
          </p>
          <div className="text-sm text-slate-500">
            <p>• Vote on dispute resolutions</p>
            <p>• Stake SWEEP tokens for voting rights</p>
            <p>• Earn rewards for participation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-1">
        <div className="flex space-x-1">
          {[
            { id: "disputes" as const, label: "Disputes", icon: "⚖️" },
            { id: "voting" as const, label: "Voting", icon: "🗳️" },
            { id: "staking" as const, label: "Staking", icon: "💰" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-cyan-300 hover:bg-cyan-200 disabled:opacity-50 text-slate-900"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Status Card */}
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Voting Rights:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  userVotingRights
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {userVotingRights ? "Active" : "Inactive"}
              </span>
            </div>
            {userVotingRights && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Staked:</span>
                <span className="text-cyan-400 font-mono">
                  {formatSweepAmount(userStakeAmount)} SWEEP
                </span>
              </div>
            )}
          </div>
          {userVotingRights && (
            <button
              onClick={handleClaimRewards}
              className="px-4 py-2 bg-cyan-300 hover:bg-cyan-200 disabled:opacity-50 text-slate-900 rounded-md text-sm transition-all duration-200"
            >
              Claim Rewards
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "disputes" && (
        <DisputesTab
          disputes={activeDisputes}
          disputeForm={disputeForm}
          setDisputeForm={setDisputeForm}
          onCreateDispute={handleCreateDispute}
          loading={loading}
        />
      )}

      {activeTab === "voting" && (
        <VotingTab
          votes={activeVotes}
          userVotingRights={userVotingRights}
          onCastVote={handleCastVote}
          loading={loading}
        />
      )}

      {activeTab === "staking" && (
        <StakingTab
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          userStakeAmount={userStakeAmount}
          platformInfo={platformInfo}
          onStake={handleStakeTokens}
          loading={loading}
        />
      )}
    </div>
  );
}

// Disputes Tab Component
function DisputesTab({
  disputes,
  disputeForm,
  setDisputeForm,
  onCreateDispute,
  loading,
}: DisputesTabProps) {
  return (
    <div className="space-y-6">
      {/* Create Dispute Form */}
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">
          Create Dispute
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Sweepstakes ID *
            </label>
            <input
              type="text"
              value={disputeForm.sweepstakesId}
              onChange={(e) =>
                setDisputeForm({
                  ...disputeForm,
                  sweepstakesId: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter sweepstakes ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Reason *
            </label>
            <select
              value={disputeForm.reason}
              onChange={(e) =>
                setDisputeForm({ ...disputeForm, reason: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a reason</option>
              <option value="PRIZE_NOT_DELIVERED">Prize not delivered</option>
              <option value="FRAUDULENT_WINNER">
                Fraudulent winner selection
              </option>
              <option value="MISLEADING_DESCRIPTION">
                Misleading description
              </option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Evidence
            </label>
            <textarea
              value={disputeForm.evidence}
              onChange={(e) =>
                setDisputeForm({ ...disputeForm, evidence: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-purple-500"
              placeholder="Provide evidence for your dispute"
              rows={3}
            />
          </div>

          <button
            onClick={onCreateDispute}
            disabled={!disputeForm.sweepstakesId || !disputeForm.reason}
            className="w-full bg-cyan-300 hover:bg-cyan-200 disabled:opacity-50 text-slate-900 px-4 py-2 rounded-md transition-all duration-200 font-medium"
          >
            Create Dispute
          </button>
        </div>
      </div>

      {/* Active Disputes */}
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">
          Active Disputes
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-slate-400">Loading disputes...</span>
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">⚖️</div>
            <p className="text-slate-400">No active disputes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Voting Tab Component
function VotingTab({
  votes,
  userVotingRights,
  onCastVote,
  loading,
}: VotingTabProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">
        Active Governance Votes
      </h3>

      {!userVotingRights && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">⚠️</span>
            <span className="text-white">
              You need to stake SWEEP tokens to participate in voting
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-slate-400">Loading votes...</span>
        </div>
      ) : votes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🗳️</div>
          <p className="text-slate-400">No active votes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {votes.map((vote) => (
            <VoteCard
              key={vote.id}
              vote={vote}
              canVote={userVotingRights}
              onVote={onCastVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Staking Tab Component
function StakingTab({
  stakeAmount,
  setStakeAmount,
  userStakeAmount,
  platformInfo,
  onStake,
  loading,
}: StakingTabProps) {
  return (
    <div className="space-y-6">
      {/* Staking Form */}
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">
          Stake SWEEP Tokens
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Amount to Stake (SWEEP)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-purple-500"
              placeholder="0.0"
              step="0.1"
              min="0.1"
            />
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h4 className="text-purple-400 font-medium mb-2">
              ℹ️ Staking Information
            </h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>
                • Minimum stake:{" "}
                {platformInfo?.minimumStake
                  ? formatSweepAmount(platformInfo.minimumStake)
                  : "1000"}{" "}
                SWEEP
              </li>
              <li>• Staking gives you voting rights in governance</li>
              <li>• Earn rewards for participating in votes</li>
              <li>• Tokens are locked during active voting periods</li>
            </ul>
          </div>

          <button
            onClick={onStake}
            disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
            className="w-full bg-cyan-300 hover:bg-cyan-200 disabled:opacity-50 text-slate-900 px-4 py-2 rounded-md transition-all duration-200 font-medium"
          >
            Stake Tokens
          </button>
        </div>
      </div>

      {/* Current Stake Info */}
      {userStakeAmount > 0 && (
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Your Stake</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Current Stake</p>
              <p className="text-purple-400 font-mono text-lg">
                {formatSweepAmount(userStakeAmount)} SWEEP
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Voting Power</p>
              <p className="text-white text-lg">
                {(
                  (userStakeAmount / (platformInfo?.totalStaked || 1)) *
                  100
                ).toFixed(2)}
                %
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dispute Card Component
function DisputeCard({ dispute }: DisputeCardProps) {
  const status = getDisputeStatus(dispute.status);

  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-medium">Dispute #{dispute.id}</h4>
          <p className="text-slate-400 text-sm">
            Sweepstakes: {dispute.sweepstakesId}
          </p>
          <p className="text-slate-400 text-sm">Reason: {dispute.reason}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            status === "ACTIVE"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
          }`}
        >
          {status}
        </span>
      </div>

      {dispute.evidence && (
        <div className="bg-slate-700/30 rounded p-3 mb-3">
          <p className="text-slate-300 text-sm">{dispute.evidence}</p>
        </div>
      )}

      <div className="text-slate-500 text-xs">
        Created: {formatTimestamp(dispute.createdAt)}
      </div>
    </div>
  );
}

// Vote Card Component
function VoteCard({ vote, canVote, onVote }: VoteCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<string>("");

  const handleVote = (): void => {
    if (selectedChoice) {
      onVote(vote.id, selectedChoice);
    }
  };

  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-medium">{vote.title}</h4>
          <p className="text-slate-400 text-sm">{vote.description}</p>
        </div>
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          Active
        </span>
      </div>

      {canVote && (
        <div className="flex items-center space-x-2 mt-4">
          <select
            value={selectedChoice}
            onChange={(e) => setSelectedChoice(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">Select your vote</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="ABSTAIN">Abstain</option>
          </select>
          <button
            onClick={handleVote}
            disabled={!selectedChoice}
            className="px-4 py-2 bg-cyan-300 hover:bg-cyan-200 disabled:opacity-50 text-slate-900 rounded-md text-sm transition-all duration-200"
          >
            Vote
          </button>
        </div>
      )}

      <div className="text-slate-500 text-xs mt-2">
        Ends: {formatTimestamp(vote.endTime)}
      </div>
    </div>
  );
}
