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
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connect, isPending: isConnecting } = useConnectWallet();
  const { mutate: disconnect, isPending: isDisconnecting } =
    useDisconnectWallet();

  const handleConnect = () => {
    // Get the first available wallet from the wallets list
    // This ensures we pass a proper WalletWithRequiredFeatures object
    const firstWallet = wallets[0];
    if (firstWallet) {
      connect(
        { wallet: firstWallet },
        {
          onSuccess: () => {
            console.log("Connected successfully");
          },
          onError: (error) => {
            console.error("Connection failed:", error);
          },
        }
      );
    }
  };

  const handleDisconnect = () => {
    disconnect();
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
                href="/dashboard"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Dashboard
              </Link>
              <Link
                href="/governance"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Governance
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
                disabled={isConnecting || wallets.length === 0}
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
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                href="/governance"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors px-4 py-3 hover:bg-white/5 rounded-lg"
              >
                Governance
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
                      disabled={isConnecting || wallets.length === 0}
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
