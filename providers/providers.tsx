"use client";

import type { ReactNode } from "react";
import { baseSepolia, arbitrumSepolia } from "wagmi/chains"; // add baseSepolia for testing
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";



export const config = createConfig({
  chains: [baseSepolia, arbitrumSepolia], // add baseSepolia for testing’
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [arbitrumSepolia.id]: http("https://arbitrum-sepolia.drpc.org"),
  },
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
