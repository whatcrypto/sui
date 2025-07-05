"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useCurrentAccount,
  useConnectWallet,
  useDisconnectWallet,
  useWallets,
} from "@mysten/dapp-kit";
import { Menu, X, Wallet, ChevronDown } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Wallet hooks
  const account = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();

  const handleConnect = async () => {
    if (wallets.length === 0) {
      alert(
        "No wallets detected! Please install a Sui wallet extension first."
      );
      return;
    }

    setIsConnecting(true);
    try {
      connect(
        { wallet: wallets[0] },
        {
          onSuccess: () => {
            console.log("Wallet connected successfully!");
            setIsConnecting(false);
          },
          onError: (error) => {
            console.error("Failed to connect wallet:", error);
            alert(`Failed to connect wallet: ${error.message}`);
            setIsConnecting(false);
          },
        }
      );
    } catch (error) {
      console.error("Connection error:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      disconnect(undefined, {
        onSuccess: () => {
          console.log("Wallet disconnected successfully!");
          setIsDisconnecting(false);
        },
        onError: (error) => {
          console.error("Failed to disconnect wallet:", error);
          setIsDisconnecting(false);
        },
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      setIsDisconnecting(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-semibold text-white">
                SweepChain
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/sweepstakes"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Sweepstakes
              </Link>
              <Link
                href="/discover"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Discover
              </Link>
              <Link
                href="/governance"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Governance
              </Link>
              <Link
                href="/staking"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Staking
              </Link>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {account ? (
              <div className="flex items-center space-x-3">
                <div className="glass-card px-4 py-2 flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="sui-button sui-button-secondary text-sm"
                >
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="sui-button sui-button-primary text-sm"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/5">
            <div className="flex flex-col space-y-1">
              <Link
                href="/sweepstakes"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                Sweepstakes
              </Link>
              <Link
                href="/discover"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                Discover
              </Link>
              <Link
                href="/governance"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                Governance
              </Link>
              <Link
                href="/staking"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                Staking
              </Link>

              {/* Mobile Wallet Section */}
              <div className="pt-4 mt-4 border-t border-white/5">
                {account ? (
                  <div className="space-y-3 px-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Wallet className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                      </span>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                      className="sui-button sui-button-secondary w-full text-sm"
                    >
                      {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                    </button>
                  </div>
                ) : (
                  <div className="px-4">
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="sui-button sui-button-primary w-full text-sm"
                    >
                      {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
