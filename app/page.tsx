"use client";
import Balances from "@/components/get-balances";
import { useRefetchBalances } from "@/hooks/refetch-balances";
import { broadcastOnEvm } from "@/hooks/swap";
import { shortenAddress } from "@/lib/common";
import { Link, SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const axctionRequestB2A = {
  actionType: "swap-action",
  sender: "0x108e41248841d0c0d2303222324fF21C3ca88d73",
  srcToken: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
  dstToken: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE", // WETH on Arbitrum Sepolia
  srcChainId: 84532, // Base Sepolia Chain ID
  dstChainId: 421614, // Arbitrum Sepolia Chain ID
  slippage: 100, // bps
  swapDirection: "exact-amount-in",
  amount: 1000000, // 1 USDC (6 decimals)
  recipient: "0x108e41248841d0c0d2303222324fF21C3ca88d73",
};

// Helper function to format token amount (assuming USDC has 6 decimals)
const formatTokenAmount = (amount: number, decimals = 6) => {
  return (amount / 10 ** decimals).toFixed(2);
};

// Helper function to map chain IDs to names
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

// {"success":false,"error":{"code":401,"name":"ApiError","message":"API Key is invalid.","title":"Internal Server Error"}}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState({
    txHash: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res: undefined as any,
  }); // State to store transaction hash
  const refetchBalances = useRefetchBalances();

  const handleSwap = async () => {
    setIsLoading(true);
    setTxHash({ txHash: null, res: undefined }); // Reset previous txHash
    try {
      const { txHash, tx, gas, ...res } = await broadcastOnEvm({
        actionRequest: axctionRequestB2A,
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
      setTxHash({ txHash, res }); // Store txHash for display

      setIsLoading(false);
      await refetchBalances(); // Refetch balances on Base Sepolia after swap
    } catch (error) {
      console.error("Error during swap:", error);
      alert(`Error during swap: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <div>
          <h1 className="text-2xl">Francesco Noceti&apos;s wallet on EVM</h1>
          <h2>{axctionRequestB2A.sender}</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex flex-col gap-2 border rounded-2xl py-3 items-center px-5">
            <h2 className="text-xl flex items-center gap-2">
              Wallet on {getChainName(axctionRequestB2A.srcChainId)}
            </h2>
            <div>
              <p className="text-gray-400">Balances</p>
              <Balances chainId={axctionRequestB2A.srcChainId} />
            </div>
          </div>
          <div className="flex flex-col gap-2 border rounded-2xl py-3 items-center px-5">
            <h2 className="text-xl">
              Wallet on {getChainName(axctionRequestB2A.dstChainId)}
            </h2>
            <div>
              <p className="text-gray-400">Balances</p>
              <Balances chainId={axctionRequestB2A.dstChainId} />
            </div>
            {/* New div for Arbitrum Sepolia swap info */}
          </div>
        </div>
        <div className="bg-gray-300 py-6 px-10 rounded-3xl flex flex-col gap-4 items-center">
          <p>
            Swap 1 USDC to ETH on Base Sepolia and bridge to Arbitrium Sepolia
          </p>
          <button
            className="py-2 px-4 rounded-3xl bg-amber-500 text-white hover:text-black hover:bg-amber-300 font-bold transition-all active:scale-95 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed"
            onClick={handleSwap}
            disabled={isLoading}>
            {isLoading ? "Swapping..." : "Swap & Bridge"}
          </button>
        </div>
        <div>
          {txHash.res && (
            <div className=" flex gap-6">
              <div className="flex flex-col gap-2 text-sm text-gray-600 mt-2 shrink-0">
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
                  <strong>Chain:</strong>{" "}
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
              </div>
              <div>
                {txHash.txHash && (
                  <>
                    <p className="flex items-center gap-1">
                      <strong>Transaction Hash:</strong>{" "}
                      <a
                        href={`https://sepolia.basescan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center">
                        {(txHash.txHash as string).slice(0, 6)}...
                        {(txHash.txHash as string).slice(-4)}
                        <SquareArrowOutUpRight className="w-4 h-4 ml-1" />
                      </a>
                    </p>
                    <p className="flex items-center gap-1">
                      <strong>Result:</strong>
                      {JSON.stringify(
                        txHash.res.error ? "Error" : "Success"
                      )}{" "}
                      {JSON.stringify(txHash.res.error.code)}{" "}
                      {JSON.stringify(txHash.res.error.message)}
                    </p>
                    <p className=" w-[300px] font-bold text-red-500">
                      {JSON.stringify(txHash.res.error)
                        ? `Please give me a Valid API Key, the one I'm using is not working`
                        : ""}
                    </p>
                    <p className=" w-[300px]">
                      {JSON.stringify(txHash.res.error)
                        ? "As we can tell even if the error is happening the backend is still inscribing an empty transaction on the Base Sepolia chain, which is diminuishing each time the amount of ETH in the Base token!"
                        : ""}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
