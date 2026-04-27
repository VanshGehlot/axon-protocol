import { NextResponse } from "next/server";
import { createMockDeployment } from "@/lib/axon";
import { getAvalancheNetworkSnapshot } from "@/lib/avalanche-live";
import { saveMockDeployment } from "@/lib/mock-store";
import type { DeploymentRecord, DeploymentResult, L1Config } from "@/lib/types";

export const runtime = "nodejs";

type DeployRequest = {
  config?: L1Config;
  walletAddress?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as DeployRequest;

  if (!body.config) {
    return NextResponse.json({ error: "Missing L1 config" }, { status: 400 });
  }

  const result: DeploymentResult = createMockDeployment(
    body.config,
    body.walletAddress || body.config.feeRecipient,
  );

  try {
    result.networkPreflight = await getAvalancheNetworkSnapshot();
  } catch {
    // Deployment remains mocked, but the response shape includes live preflight when Fuji is reachable.
  }
  const record: DeploymentRecord = {
    id: `dep_${result.txHash.slice(2, 10)}`,
    config: body.config,
    result,
    walletAddress: body.walletAddress || body.config.feeRecipient,
    createdAt: new Date().toISOString(),
  };

  saveMockDeployment(record);

  return NextResponse.json(result);
}
