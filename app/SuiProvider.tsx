"use client";
import React from "react";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a query client for React Query
const queryClient = new QueryClient();

// Network configuration for Sui blockchain
const networks = {
  devnet: { url: getFullnodeUrl("devnet") },
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

// Props interface for the SuiProvider component
interface SuiProviderProps {
  children: React.ReactNode;
}

/**
 * SuiProvider component that wraps the app with Sui blockchain context
 * Provides wallet connection, client, and query capabilities
 */
function SuiProvider({ children }: SuiProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="devnet">
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default SuiProvider;
