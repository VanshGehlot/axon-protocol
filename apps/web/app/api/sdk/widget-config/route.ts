import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { apiKey?: string; chainId?: string };

  if (!body.apiKey || !body.chainId) {
    return NextResponse.json({ error: "apiKey and chainId are required" }, { status: 400 });
  }

  return NextResponse.json({
    config: {
      chainId: body.chainId,
      theme: "dark",
      agentName: "Axon",
      capabilities: ["chain-qna", "wallet-guidance", "gas-explainer"],
      endpoint: "/api/agent/chat",
    },
  });
}
