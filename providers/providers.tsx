// Wagmi + React Query provider setup.
// Configures all supported chains (mainnets + testnets) with their RPC transports,
// then wraps the app in WagmiProvider and QueryClientProvider so any component
// can use Wagmi hooks (useBalance, useReadContract, etc.) and benefit from
// React Query's caching/invalidation.
"use client";

import type { ReactNode } from "react";
import {
  baseSepolia,
  arbitrumSepolia,
  mainnet,
  arbitrum,
  optimism,
  polygon,
  bsc,
  base,
  sepolia,
} from "wagmi/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// All chains the app supports — both mainnets and testnets
const chains = [
  mainnet,
  arbitrum,
  optimism,
  polygon,
  bsc,
  base,
  sepolia, // Ethereum Sepolia
  baseSepolia, // Base Sepolia
  arbitrumSepolia, // Arbitrum Sepolia
] as const;

// --- Set up RPC transports for each chain ---
const transports: Record<number, ReturnType<typeof http>> = {
  [mainnet.id]: http(
    "https://mainnet.infura.io/v3/7dcd7aef3de84c84b87c29609d2332bc"
  ),
  [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
  [optimism.id]: http("https://mainnet.optimism.io"),
  [polygon.id]: http("https://polygon-rpc.com"),
  [bsc.id]: http("https://bsc-dataseed.binance.org/"),
  [base.id]: http("https://mainnet.base.org"),
  [sepolia.id]: http(
    "https://sepolia.infura.io/v3/7dcd7aef3de84c84b87c29609d2332bc"
  ),
  [baseSepolia.id]: http(
    "https://base-sepolia.infura.io/v3/7dcd7aef3de84c84b87c29609d2332bc"
  ),
  [arbitrumSepolia.id]: http("https://arbitrum-sepolia.drpc.org"),
};

// --- Wagmi config ---
export const config = createConfig({
  chains,
  transports,
});

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
