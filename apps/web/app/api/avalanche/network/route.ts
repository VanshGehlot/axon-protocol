import { NextResponse } from "next/server";
import { getAvalancheNetworkSnapshot } from "@/lib/avalanche-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getAvalancheNetworkSnapshot());
  } catch (error) {
    return NextResponse.json(
      {
        error: "Avalanche Fuji SDK request failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
