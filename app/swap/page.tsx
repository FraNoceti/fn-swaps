// Dynamic swap page — users connect MetaMask, pick source/destination chains and tokens,
// enter an amount, and execute a cross-chain swap via broadcastOnEvm.
// Supports multiple mainnets and testnets with real-time balance display.
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { useState, useEffect } from "react";
import { metaMask } from "wagmi/connectors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRefetchBalances } from "@/hooks/refetch-balances";
import { ethers } from "ethers";
import { broadcastOnEvm } from "@/hooks/swap";

const ETH_ZERO = "0x0000000000000000000000000000000000000000" as `0x${string}`;

const supportedChains = [
  { id: 1, name: "Ethereum", nativeToken: "ETH" },
  { id: 42161, name: "Arbitrum One", nativeToken: "ETH" },
  { id: 10, name: "Optimism", nativeToken: "ETH" },
  { id: 137, name: "Polygon", nativeToken: "MATIC" },
  { id: 8453, name: "Base", nativeToken: "ETH" },
  { id: 56, name: "BSC", nativeToken: "BNB" },
  { id: 11155111, name: "Ethereum Sepolia", nativeToken: "ETH" },
  { id: 84532, name: "Base Sepolia", nativeToken: "ETH" },
];

const WETH_ADDRESSES: Record<number, string> = {
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  42161: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  10: "0x4200000000000000000000000000000000000006",
  137: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  8453: "0x4200000000000000000000000000000000000006",
  56: "0x4DB5a66E937A9f4473FA95B1cAF1d1e1d62E29EA",
  11155111: "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
  84532: "0x4200000000000000000000000000000000000006",
};

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const account = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const refetchBalances = useRefetchBalances();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [srcChainId, setSrcChainId] = useState<number>(84532); // Base Sepolia default
  const [dstChainId, setDstChainId] = useState<number>(421614); // Arbitrum Sepolia default
  const [srcTokenSymbol, setSrcTokenSymbol] = useState<"ETH" | "WETH">("ETH");
  const [dstTokenSymbol, setDstTokenSymbol] = useState<"ETH" | "WETH">("WETH");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<{ txHash: string | null; res?: any }>({
    txHash: null,
    res: undefined,
  });

  // get balance on source chain
  const tokenAddress =
    srcTokenSymbol === "ETH"
      ? ETH_ZERO
      : (WETH_ADDRESSES[srcChainId] as `0x${string}`);
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address,
    token: tokenAddress === ETH_ZERO ? undefined : tokenAddress,
    chainId: srcChainId,
  });

  const balanceBN = (balanceData?.value as bigint) ?? BigInt(0);
  const formattedBalance = mounted ? ethers.formatUnits(balanceBN, 18) : "—";

  const parseAmount = (val: string) => {
    try {
      return ethers.parseUnits(val || "0", 18);
    } catch {
      return BigInt(0);
    }
  };
  const amountBN = parseAmount(amount);

  const hasSufficientBalance =
    mounted && amountBN > BigInt(0) && amountBN <= balanceBN;

  const setMax = () => setAmount(formattedBalance);

  const handleSwap = async () => {
    if (!mounted) return;
    if (!isConnected) return alert("Please connect your wallet.");
    if (!hasSufficientBalance) return alert("Insufficient balance.");
    if (srcChainId === dstChainId)
      return alert("Please select different source and destination chains.");

    setIsLoading(true);
    setTxHash({ txHash: null, res: undefined });

    // populate action request dynamically
    const actionRequestB2A = {
      actionType: "swap-action",
      sender: address,
      srcToken:
        srcTokenSymbol === "ETH" ? ETH_ZERO : WETH_ADDRESSES[srcChainId],
      dstToken:
        dstTokenSymbol === "ETH" ? ETH_ZERO : WETH_ADDRESSES[dstChainId],
      srcChainId,
      dstChainId,
      slippage: 100, // 1%
      swapDirection: "exact-amount-in",
      amount: Number(ethers.formatUnits(amountBN, 18)) * 10 ** 18, // convert to smallest unit
      recipient: address,
    };

    try {
      const { txHash, tx, gas, ...res } = await broadcastOnEvm({
        actionRequest: actionRequestB2A,
        accountConnected: account,
      });
      console.log(
        "Transaction Hash:",
        txHash,
        "tx:",
        tx,
        "gas:",
        gas,
        "Else:",
        res
      );
      setTxHash({ txHash, res });

      setIsLoading(false);
      await refetchBalances();
      setAmount("");
    } catch (error: any) {
      console.error("Error during swap:", error);
      alert(`Error during swap: ${error?.message || error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 space-y-8 bg-gradient-to-b from-green-900 to-indigo-900 text-white">
      <Card className="w-full max-w-md bg-gray-800 text-white border-none shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            ...Or more classic
            <br />
            Swap & Bridge ETH ↔ WETH
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Wallet */}
          {!mounted ? (
            <div className="space-y-2">
              <div className="h-4 w-44 rounded bg-gray-700 animate-pulse" />
            </div>
          ) : isConnected ? (
            <div className="space-y-2">
              <p className="break-all">Connected Wallet: {address}</p>
              <Button variant="destructive" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => connect({ connector: metaMask() })}
              className="w-full bg-blue-600 hover:bg-blue-500">
              Connect MetaMask
            </Button>
          )}

          {/* From */}
          <div className="space-y-2 p-4 bg-gray-900 rounded-lg">
            <Label>From</Label>
            <div className="flex items-center justify-between gap-2">
              <Select
                value={srcChainId.toString()}
                onValueChange={(value) => setSrcChainId(Number(value))}>
                <SelectTrigger className="bg-gray-800 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={srcTokenSymbol}
                onValueChange={(v: any) => {
                  setSrcTokenSymbol(v);
                  setDstTokenSymbol(v === "ETH" ? "WETH" : "ETH");
                }}>
                <SelectTrigger className="bg-gray-800 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="WETH">WETH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border-none text-right text-xl flex-1"
              />
              <Button
                variant="ghost"
                onClick={setMax}
                className="whitespace-nowrap">
                MAX
              </Button>
            </div>

            <p className="text-xs text-gray-300">
              Balance: {balanceLoading || !mounted ? "—" : formattedBalance}{" "}
              {srcTokenSymbol}
            </p>
            {mounted && amount && !hasSufficientBalance && (
              <p className="text-xs text-red-400">Insufficient balance.</p>
            )}
          </div>

          {/* To (preview) */}
          <div className="space-y-2 p-4 bg-gray-900 rounded-lg">
            <Label>To</Label>
            <div className="flex items-center justify-between gap-2">
              <Select
                value={dstChainId.toString()}
                onValueChange={(value) => setDstChainId(Number(value))}>
                <SelectTrigger className="bg-gray-800 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                disabled
                value={amount || ""}
                className="bg-gray-800 border-none text-right text-xl flex-1"
              />
            </div>
            <p className="text-xs text-gray-300">
              ≈ {amount || "0"} {dstTokenSymbol} on{" "}
              {supportedChains.find((c) => c.id === dstChainId)?.name}
            </p>
          </div>

          {/* Swap button */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg"
            onClick={handleSwap}
            disabled={
              !mounted ||
              isLoading ||
              !isConnected ||
              !amount ||
              !hasSufficientBalance ||
              balanceLoading
            }>
            {(!mounted && "Loading...") ||
              (isLoading ? "Swapping & Bridging..." : "Swap & Bridge")}
          </Button>

          {txHash.txHash && (
            <p className="text-xs text-green-400 break-all">
              Tx Hash: {txHash.txHash}
            </p>
          )}
        </CardContent>
      </Card>
      <div className="text-gray-500 text-sm flex flex-wrap gap-2 justify-center items-center">
        Powered by{" "}
        <a
          href="https://swaps.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600">
          Swaps.xyz
        </a>
        ,{" "}
        <a
          href="https://wagmi.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600">
          Wagmi
        </a>
        ,{" "}
        <a
          href="https://viem.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600">
          Viem
        </a>{" "}
        &amp;{" "}
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600">
          Next.js
        </a>
      </div>
    </div>
  );
}
