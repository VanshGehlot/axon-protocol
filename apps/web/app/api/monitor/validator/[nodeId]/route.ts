import { NextResponse } from "next/server";
import { getChainMonitorProvider } from "@/lib/monitor-provider";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { nodeId: string } }) {
  const provider = getChainMonitorProvider();
  return NextResponse.json(await provider.getValidator(params.nodeId));
}
