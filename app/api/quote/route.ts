/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/quote/route.ts
import { NextResponse } from "next/server";

const ONEINCH_BASE = "https://api.1inch.io/v5.0";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // tighten this in prod
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qs = url.searchParams;
    const chain = qs.get("chain"); // required
    const from = qs.get("from"); // required: token address or 0xEeee...
    const to = qs.get("to"); // required
    const amount = qs.get("amount"); // required (smallest units)

    if (!chain || !from || !to || !amount) {
      return NextResponse.json(
        { error: "Missing required params: chain, from, to, amount" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // build 1inch URL
    const oneInchUrl = `${ONEINCH_BASE}/${encodeURIComponent(chain)}/quote?fromTokenAddress=${encodeURIComponent(
      from
    )}&toTokenAddress=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`;

    // call 1inch from server (no browser CORS restrictions)
    const r = await fetch(oneInchUrl, {
      method: "GET",
      headers: {
        // you can add a custom User-Agent here if you want
        Accept: "application/json",
      },
    });

    // pass through status and body
    const data = await r.text(); // read as text and pass through so we keep exact body
    const status = r.status;

    return new NextResponse(data, {
      status,
      headers: {
        "Content-Type": r.headers.get("content-type") ?? "application/json",
        "Access-Control-Allow-Origin": "*", // restrict to your origin in production
      },
    });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "Proxy error", details: String(err?.message ?? err) },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
