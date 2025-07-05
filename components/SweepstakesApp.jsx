"use client";
import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import {
  createSweepstakes,
  enterSweepstakes,
  selectWinner,
  submitProofOfDelivery,
  getActiveSweepstakes,
  getHostSweepstakes,
  getParticipantEntries,
  hasEnteredSweepstakes,
} from "../lib/smart-contract/index.js";
import { BrowseSweepstakes } from "./BrowseSweepstakes.jsx";
import { CreateSweepstakes } from "./CreateSweepstakes.jsx";
import { HostedSweepstakes } from "./HostedSweepstakes.jsx";
import { EnteredSweepstakes } from "./EnteredSweepstakes.jsx";

export function SweepstakesApp() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // State management
  const [activeTab, setActiveTab] = useState("browse"); // browse, create, hosted, entered
  const [activeSweepstakes, setActiveSweepstakes] = useState([]);
  const [hostedSweepstakes, setHostedSweepstakes] = useState([]);
  const [enteredSweepstakes, setEnteredSweepstakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state for creating new sweepstakes
  const [newSweepstakes, setNewSweepstakes] = useState({
    title: "",
    description: "",
    prizeAmount: 0,
    maxParticipants: 100,
    endTimestamp: "",
    deliveryInfo: "",
  });

  // Load data on component mount and account change
  useEffect(() => {
    if (account) {
      loadAllData();
    }
  }, [account]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load active sweepstakes for browsing
      const active = await getActiveSweepstakes();
      setActiveSweepstakes(active);

      // Load user-specific data if connected
      if (account) {
        const hosted = await getHostSweepstakes(account.address);
        const entered = await getParticipantEntries(account.address);
        setHostedSweepstakes(hosted);
        setEnteredSweepstakes(entered);
      }
    } catch (error) {
      console.error("Failed to load sweepstakes data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSweepstakes = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (
      !newSweepstakes.title ||
      !newSweepstakes.description ||
      newSweepstakes.prizeAmount <= 0
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      // Convert end timestamp to milliseconds
      const endTimestampMs = new Date(newSweepstakes.endTimestamp).getTime();

      // Create the sweepstakes transaction
      const transaction = await createSweepstakes(
        newSweepstakes.title,
        newSweepstakes.description,
        newSweepstakes.prizeAmount * 1000000000, // Convert to SWEEP base units
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
            loadAllData(); // Refresh data
            setActiveTab("hosted"); // Switch to hosted tab
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

  const handleEnterSweepstakes = async (sweepstakesId) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Check if already entered
      const alreadyEntered = await hasEnteredSweepstakes(
        sweepstakesId,
        account.address
      );
      if (alreadyEntered) {
        alert("You have already entered this sweepstakes!");
        return;
      }

      const transaction = await enterSweepstakes(sweepstakesId);

      signAndExecute(
        { transaction },
        {
          onSuccess: () => {
            console.log("Successfully entered sweepstakes!");
            loadAllData(); // Refresh data
          },
          onError: (error) => {
            console.error("Failed to enter sweepstakes:", error);
            alert("Failed to enter sweepstakes. Check console for details.");
          },
        }
      );
    } catch (error) {
      console.error("Error entering sweepstakes:", error);
      alert("Error entering sweepstakes. Check console for details.");
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
            loadAllData(); // Refresh data
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
            loadAllData(); // Refresh data
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
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">
            Sweepstakes Platform
          </h3>
          <p className="text-slate-400 mb-4">
            Connect your wallet to participate in sweepstakes or host your own!
          </p>
          <div className="text-sm text-slate-500">
            <p>• Enter sweepstakes for free</p>
            <p>• Host your own sweepstakes</p>
            <p>• Guaranteed prize payouts</p>
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
            { id: "browse", label: "Browse", icon: "🔍" },
            { id: "create", label: "Create", icon: "➕" },
            { id: "hosted", label: "My Hosted", icon: "🏆" },
            { id: "entered", label: "My Entries", icon: "🎫" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "browse" && (
        <BrowseSweepstakes
          sweepstakes={activeSweepstakes}
          loading={loading}
          onEnter={handleEnterSweepstakes}
          onRefresh={loadAllData}
          userAddress={account.address}
        />
      )}

      {activeTab === "create" && (
        <CreateSweepstakes
          newSweepstakes={newSweepstakes}
          setNewSweepstakes={setNewSweepstakes}
          creating={creating}
          onSubmit={handleCreateSweepstakes}
        />
      )}

      {activeTab === "hosted" && (
        <HostedSweepstakes
          sweepstakes={hostedSweepstakes}
          loading={loading}
          onSelectWinner={handleSelectWinner}
          onSubmitProof={handleSubmitProof}
          onRefresh={loadAllData}
        />
      )}

      {activeTab === "entered" && (
        <EnteredSweepstakes
          sweepstakes={enteredSweepstakes}
          loading={loading}
          onRefresh={loadAllData}
        />
      )}
    </div>
  );
}