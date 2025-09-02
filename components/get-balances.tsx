"use client";

import { useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { shortenAddress } from "@/lib/common";
import { SquareArrowOutUpRight } from "lucide-react";

export const FIXED_ADDRESS =
  "0x108e41248841d0c0d2303222324fF21C3ca88d73" as `0x${string}`; // Replace with your address
export const TOKEN_CONTRACTS = [
  {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
    name: "USDC",
  }, // Replace with actual token addresses
];

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

// Sub-component for rendering a single token's balance
function TokenBalance({
  token,
  chainId,
}: {
  token: { address: `0x${string}`; name: string };
  chainId: number;
}) {
  // Fetch token balance
  const {
    data: tokenBalance,
    isLoading: tokenLoading,
    error: tokenError,
  } = useReadContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [FIXED_ADDRESS],
    chainId,
  });

  // Fetch token decimals
  const { data: decimals, isLoading: decimalsLoading } = useReadContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: "decimals",
    chainId,
  });

  return (
    <div>
      {tokenLoading || decimalsLoading ? (
        <p>Loading...</p>
      ) : tokenError ? null : tokenBalance && typeof decimals === "number" ? (
        <p>
          {token.name} Balance: {formatUnits(tokenBalance as bigint, decimals)}{" "}
          {token.name}
        </p>
      ) : null}
    </div>
  );
}

export default function Balances({ chainId }: { chainId: number }) {
  // Fetch ETH balance
  const {
    data: ethBalance,
    isLoading: ethLoading,
    error: ethError,
  } = useBalance({
    address: FIXED_ADDRESS,
    chainId,
  });

  return (
    <div>
      <p className=" flex items-center gap-1">
        Address:{" "}
        <a
          href={
            chainId === 84532 // Base Sepolia
              ? `https://sepolia.basescan.org/address/${FIXED_ADDRESS}`
              : chainId === 421614 // Arbitrum Sepolia
              ? `https://sepolia.arbiscan.io/address/${FIXED_ADDRESS}`
              : chainId === 1
              ? `https://etherscan.io/address/${FIXED_ADDRESS}`
              : chainId === 137
              ? `https://polygonscan.com/address/${FIXED_ADDRESS}`
              : chainId === 10
              ? `https://optimistic.etherscan.io/address/${FIXED_ADDRESS}`
              : chainId === 42161
              ? `https://arbiscan.io/address/${FIXED_ADDRESS}`
              : `https://etherscan.io/address/${FIXED_ADDRESS}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className=" flex hover:underline text-blue-500 items-center"
        >
          {shortenAddress(FIXED_ADDRESS)}<SquareArrowOutUpRight className="w-4 h-4 ml-1" />
        </a>
      </p>
      {ethLoading && <p>Loading...</p>}
      {ethError && (
        <p style={{ color: "red" }}>ETH Error: {ethError.message}</p>
      )}
      {ethBalance && (
        <p>
          ETH Balance: {ethBalance.formatted} {ethBalance.symbol}
        </p>
      )}
      <h2>Token Balances</h2>
      {TOKEN_CONTRACTS.map((token) => (
        <TokenBalance key={token.address} token={token} chainId={chainId} />
      ))}
    </div>
  );
}
