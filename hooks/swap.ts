/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from "@/providers/providers";
import { sendTransaction, estimateGas } from "@wagmi/core";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount } from "wagmi";

// Ensure PRIVATE_KEY is set
const accountFixed = privateKeyToAccount(
  process.env.NEXT_PUBLIC_PRIVATE_KEY as `0x${string}`
);

// const actionRequest = {
//   actionType: "swap-action",
//   sender: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", // generally the user's connected wallet address
//   srcToken: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC on Base
//   dstToken: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT on Arbitrum
//   srcChainId: 8453, // Base Chain ID
//   dstChainId: 42161, // Arbitrum Chain ID
//   slippage: 100, // bps
//   swapDirection: "exact-amount-in",
//   amount: 10000000n, // denominated in srcToken decimals
//   recipient: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
// };

async function getAction({
  actionRequest,
}: {
  actionRequest: any;
}): Promise<any> {
  const url = new URL("https://api-v2.swaps.xyz/api/getAction");

  Object.entries(actionRequest).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const requestOptions = {
    method: "GET",
    headers: { "x-api-key": process.env.NEXT_PUBLIC_SWAPS_API_KEY! },
  };

  const response = await fetch(url.toString(), requestOptions);

  return await response.json();
}

export async function broadcastOnEvm({
  actionRequest,
  accountConnected,
}: {
  actionRequest: any;
  accountConnected?: ReturnType<typeof useAccount>;
}): Promise<any> {
  const account = accountConnected ? accountConnected : accountFixed;
  // Get the account address from actionRequest.sender or another appropriate field
  const { tx, ...res } = await getAction({ actionRequest });
  const gas = await estimateGas(config, { account, ...tx });

  const txHash = await sendTransaction(config, {
    account,
    ...tx,
    gas,
  });

  return { ...res, txHash, tx, gas };
}
