// lib/refetchBalances.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getBalanceQueryOptions, readContractQueryOptions } from "wagmi/query";
import { config } from "@/providers/providers"; // Your Wagmi config with baseSepolia, arbitrumSepolia
import {
  ERC20_ABI,
  FIXED_ADDRESS,
  TOKEN_CONTRACTS,
} from "@/components/get-balances"; // Your constants

// Derive chain IDs from config
type ChainId = typeof config.chains[number]["id"]; // 84532 | 421614

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