import { NextResponse } from "next/server";
import { explainConfig, generateL1Config } from "@/lib/axon";
import type { AgentChatRequest, AgentChatResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as AgentChatRequest;
  const message = body.message?.trim() ?? "";

  if (!message) {
    return NextResponse.json<AgentChatResponse>({
      reply: "Send a chain goal or monitoring question and I will help from there.",
      action: "INFO",
    });
  }

  const lowered = message.toLowerCase();
  if (/\b(yes|deploy|ship|confirm|go ahead)\b/.test(lowered)) {
    return NextResponse.json<AgentChatResponse>({
      reply: "Confirmed. I will use the latest reviewed config for the Fuji deployment request.",
      action: "DEPLOY",
    });
  }

  if (/\b(health|uptime|monitor|how are|status|block time|gas trend)\b/.test(lowered)) {
    return NextResponse.json<AgentChatResponse>({
      reply:
        "Your monitor view tracks validator uptime against the 90% ACP-267 threshold, current TPS, block time, 24h transactions, gas trend, and ICM message count. Open Monitor for the latest chain summary.",
      action: "MONITOR",
    });
  }

  const config = generateL1Config(message, body.walletAddress);
  return NextResponse.json<AgentChatResponse>({
    reply: explainConfig(config),
    action: "INFO",
    config,
  });
}
