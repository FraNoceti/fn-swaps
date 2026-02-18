# fn-swaps

A cross-chain swap and bridge demo app built with Next.js. Uses the [Swaps.xyz](https://swaps.xyz) API to execute token swaps and bridges across EVM chains, with [Wagmi](https://wagmi.sh) and [Viem](https://viem.sh) for wallet and transaction management.

**Live demo:** [fn-swaps.vercel.app](https://fn-swaps.vercel.app)

## Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **React 19**
- **Wagmi v2** + **Viem** — wallet connection, transaction sending, on-chain reads
- **TanStack React Query** — caching and refetching on-chain data
- **Swaps.xyz API** — cross-chain swap/bridge routing
- **Ethers.js v6** — amount parsing/formatting on the dynamic swap page
- **shadcn/ui** + **Tailwind CSS v4** — UI components and styling

## Project Structure

```
app/
  page.tsx              # Preset swap page (hardcoded USDC → WETH, Base Sepolia → Arbitrum Sepolia)
  swap/page.tsx         # Dynamic swap page (MetaMask-connected, user-configurable)
  api/quote/route.ts    # Server-side proxy for 1inch quote API (avoids browser CORS)
  layout.tsx            # Root layout with providers
components/
  get-balances.tsx      # ERC-20 and native token balance display component
  ui/                   # shadcn/ui components (button, card, input, select, etc.)
hooks/
  swap.ts               # Core swap logic: calls Swaps.xyz getAction API, broadcasts tx
  refetch-balances.ts   # Invalidates cached balance queries after a swap
lib/
  common.ts             # Shared utilities (address shortening, etc.)
providers/
  providers.tsx         # Wagmi + React Query provider setup with multi-chain config
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SWAPS_API_KEY=your_swaps_xyz_api_key
NEXT_PUBLIC_PRIVATE_KEY=your_wallet_private_key   # Used by the preset swap page
```

- `NEXT_PUBLIC_SWAPS_API_KEY` — API key from [Swaps.xyz](https://swaps.xyz)
- `NEXT_PUBLIC_PRIVATE_KEY` — Private key for the hardcoded wallet on the preset swap page (testnet only)

## Setup & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Pages

### `/` — Preset Swap

A one-click demo that swaps 1 USDC on Base Sepolia to WETH on Arbitrum Sepolia using a hardcoded wallet. Shows source/destination chain balances and transaction details after execution.

### `/swap` — Dynamic Swap

A full swap interface where users connect MetaMask, pick source/destination chains and tokens (ETH/WETH), enter an amount, and execute the swap. Supports multiple mainnets and testnets.
