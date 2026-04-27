import { NextResponse } from "next/server";
import { listMockDeployments } from "@/lib/mock-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ deployments: listMockDeployments() });
}
