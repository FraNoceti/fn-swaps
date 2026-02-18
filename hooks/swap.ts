/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from "@/providers/providers";
import { sendTransaction, estimateGas } from "@wagmi/core";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount } from "wagmi";

// Fixed account derived from env — used by the preset swap page (no wallet connection needed).
// Lazy-init to avoid crashing at build time when the env var isn't set.
let accountFixed: ReturnType<typeof privateKeyToAccount> | null = null;
function getAccountFixed() {
  if (!accountFixed) {
    accountFixed = privateKeyToAccount(
      process.env.NEXT_PUBLIC_PRIVATE_KEY as `0x${string}`
    );
  }
  return accountFixed;
}

// Calls the Swaps.xyz getAction API with the given action request params.
// Returns the unsigned transaction (`tx`) along with route/quote metadata.
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

// Fetches a swap route via getAction, estimates gas, and broadcasts the transaction.
// Uses the connected wallet account if provided, otherwise falls back to the fixed account.
export async function broadcastOnEvm({
  actionRequest,
  accountConnected,
}: {
  actionRequest: any;
  accountConnected?: ReturnType<typeof useAccount>;
}): Promise<any> {
  const account = accountConnected ? accountConnected : getAccountFixed();
  const { tx, ...res } = await getAction({ actionRequest });
  const gas = await estimateGas(config, { account, ...tx });

  const txHash = await sendTransaction(config, {
    account,
    ...tx,
    gas,
  });

  return { ...res, txHash, tx, gas };
}
