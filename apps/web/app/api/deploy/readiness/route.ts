import { NextRequest, NextResponse } from "next/server";
import { getDeploymentReadiness } from "@/lib/deployment-readiness";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get("walletAddress") ?? undefined;
  const readiness = await getDeploymentReadiness(walletAddress);

  return NextResponse.json(readiness);
}
