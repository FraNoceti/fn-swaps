// hooks/refetch-balances.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getBalanceQueryOptions, readContractQueryOptions } from "wagmi/query";
import { config } from "@/providers/providers";
import {
  ERC20_ABI,
  FIXED_ADDRESS,
  TOKEN_CONTRACTS,
} from "@/components/get-balances";

type ChainId = typeof config.chains[number]["id"];

// Returns a function that invalidates all cached balance queries (native ETH + ERC-20 tokens).
// Call after a swap completes so the UI reflects updated balances without a full page reload.
// Can target a single chain or invalidate across all configured chains.
export function useRefetchBalances() {
  const queryClient = useQueryClient();

  return async function refetchBalances(chainId?: ChainId) {
    // Use provided chainId or all chains from config
    const chainIds = chainId ? [chainId] : config.chains.map(chain => chain.id);

    for (const id of chainIds) {
      // Refetch ETH balance for the chain
      const ethQueryKey = getBalanceQueryOptions(config, {
        address: FIXED_ADDRESS,
        chainId: id,
      }).queryKey;
      await queryClient.invalidateQueries({ queryKey: ethQueryKey });

      // Refetch token balances and decimals for each token on the chain
      for (const token of TOKEN_CONTRACTS) {
        // Token balance query key
        const tokenBalanceQueryKey = readContractQueryOptions(config, {
          address: token.address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [FIXED_ADDRESS],
          chainId: id,
        }).queryKey;
        await queryClient.invalidateQueries({ queryKey: tokenBalanceQueryKey });

        // Token decimals query key
        const decimalsQueryKey = readContractQueryOptions(config, {
          address: token.address,
          abi: ERC20_ABI,
          functionName: "decimals",
          chainId: id,
        }).queryKey;
        await queryClient.invalidateQueries({ queryKey: decimalsQueryKey });
      }
    }
  };
}