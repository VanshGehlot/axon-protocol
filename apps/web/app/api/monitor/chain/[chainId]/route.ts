import { NextResponse } from "next/server";
import { getChainMonitorProvider } from "@/lib/monitor-provider";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { chainId: string } }) {
  const provider = getChainMonitorProvider();
  return NextResponse.json(await provider.getChainHealth(params.chainId));
}
