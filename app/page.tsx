/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Balances from "@/components/get-balances";
import { useRefetchBalances } from "@/hooks/refetch-balances";
import { broadcastOnEvm } from "@/hooks/swap";
import { shortenAddress } from "@/lib/common";
import { SquareArrowOutUpRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const axctionRequestB2A = {
  actionType: "swap-action",
  sender: "0x108e41248841d0c0d2303222324fF21C3ca88d73",
  srcToken: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  dstToken: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE",
  srcChainId: 84532,
  dstChainId: 421614,
  slippage: 100,
  swapDirection: "exact-amount-in",
  amount: 1000000,
  recipient: "0x108e41248841d0c0d2303222324fF21C3ca88d73",
};

const formatTokenAmount = (amount: number, decimals = 6) =>
  (amount / 10 ** decimals).toFixed(2);

const getChainName = (chainId: number) => {
  switch (chainId) {
    case 84532:
      return "Base Sepolia";
    case 421614:
      return "Arbitrium Sepolia";
    default:
      return `Chain ID ${chainId}`;
  }
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<{ txHash: string | null; res?: any }>({
    txHash: null,
    res: undefined,
  });

  const refetchBalances = useRefetchBalances();

  const handleSwap = async () => {
    setIsLoading(true);
    setTxHash({ txHash: null, res: undefined });
    try {
      const { txHash, tx, gas, ...res } = await broadcastOnEvm({
        actionRequest: axctionRequestB2A,
      });
      setTxHash({ txHash, res });
      setIsLoading(false);
      await refetchBalances();
    } catch (error) {
      console.error("Error during swap:", error);
      alert(`Error during swap: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-orange-600 flex flex-col items-center text-white justify-center gap-10 font-sans">
      <Card className="w-full max-w-md lg:max-w-4xl bg-gray-900 gap-y-4 text-white rounded-2xl shadow-xl p-6">
        <CardHeader className=" w-full text-center mb-4">
          <CardTitle className="text-3xl">Swap & Bridge</CardTitle>
          <CardDescription className=" flex items-center gap-2 justify-center">
            Presetted wallet:{" "}
            <Badge variant="secondary">
              {shortenAddress(axctionRequestB2A.sender)}
            </Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 rounded-xl p-4 gap-2 text-center text-white">
            <CardTitle className="text-xl mb-2">Source Chain</CardTitle>
            <CardDescription className="text-white text-xl">
              {getChainName(axctionRequestB2A.srcChainId)}
            </CardDescription>
            <div className="mt-3">
              <p className="text-gray-400">Balances</p>
              <Balances chainId={axctionRequestB2A.srcChainId} />
            </div>
          </Card>

          <Card className="bg-gray-800 rounded-xl p-4 gap-2 text-center text-white">
            <CardTitle className="text-xl mb-2">Destination Chain</CardTitle>
            <CardDescription className="text-white text-xl">
              {getChainName(axctionRequestB2A.dstChainId)}
            </CardDescription>
            <div className="mt-3">
              <p className="text-gray-400">Balances</p>
              <Balances chainId={axctionRequestB2A.dstChainId} />
            </div>
          </Card>
        </CardContent>
        <div className=" space-y-1">
          <div className="flex flex-col items-center mt-4">
            <Button
              onClick={handleSwap}
              disabled={isLoading}
              className="w-full max-w-sm bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-3xl">
              {isLoading ? "Swapping..." : "Swap & Bridge 1 USDC → WETH"}
            </Button>
          </div>
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
        {txHash.txHash && (
          <Collapsible className="mt-2 w-full">
            <CollapsibleTrigger className="w-full text-left text-lg font-medium py-2 px-4 bg-gray-700 rounded-xl hover:bg-gray-600">
              Transaction Details
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-gray-800 p-4 mt-2 rounded-xl flex flex-col gap-2">
              <p>
                <strong>Source Token:</strong> USDC (
                {shortenAddress(axctionRequestB2A.srcToken)})
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatTokenAmount(axctionRequestB2A.amount)} USDC
              </p>
              <p>
                <strong>Chain:</strong>{" "}
                {getChainName(axctionRequestB2A.srcChainId)}
              </p>
              <p>
                <strong>Destination Token:</strong> WETH (
                {shortenAddress(axctionRequestB2A.dstToken)})
              </p>
              <p>
                <strong>Recipient:</strong>{" "}
                {shortenAddress(axctionRequestB2A.recipient)}
              </p>
              <p>
                <strong>Destination Chain:</strong>{" "}
                {getChainName(axctionRequestB2A.dstChainId)}
              </p>
              <p>
                <strong>Swap Type:</strong> {axctionRequestB2A.actionType}
              </p>
              <p>
                <strong>Slippage:</strong> {axctionRequestB2A.slippage / 100}%
              </p>
              <p>
                <strong>Swap Direction:</strong>{" "}
                {axctionRequestB2A.swapDirection}
              </p>
              <p className="mt-2">
                <strong>Tx Hash:</strong>{" "}
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1">
                  {txHash.txHash.slice(0, 6)}...{txHash.txHash.slice(-4)}
                  <SquareArrowOutUpRight className="w-4 h-4" />
                </a>
              </p>
              {txHash.res?.error && (
                <p className="text-red-500 font-semibold mt-2">
                  Error: {txHash.res.error.message || "Check API Key!"}
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </Card>
    </div>
  );
}
