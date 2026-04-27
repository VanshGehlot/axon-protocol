"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, DatabaseZap, RadioTower } from "lucide-react";
import type { AvalancheNetworkSnapshot } from "@/lib/types";

type Status =
  | { state: "loading" }
  | { state: "ready"; data: AvalancheNetworkSnapshot }
  | { state: "error"; detail: string };

export function AvalancheLiveStatus() {
  const [status, setStatus] = useState<Status>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/avalanche/network", { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setStatus({ state: "error", detail: data.detail || data.error || "Fuji request failed" });
          return;
        }
        setStatus({ state: "ready", data: data as AvalancheNetworkSnapshot });
      } catch (error) {
        if (!cancelled) {
          setStatus({ state: "error", detail: error instanceof Error ? error.message : "Fuji request failed" });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="axon-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <RadioTower className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-xl font-semibold">Live Fuji SDK status</h2>
        </div>
        <span className="axon-code text-xs text-muted">@avalanche-sdk/client</span>
      </div>
      {status.state === "loading" && (
        <div className="p-5 text-sm text-muted">Requesting live Fuji network state through the Avalanche Client SDK.</div>
      )}
      {status.state === "error" && (
        <div className="flex gap-3 p-5 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{status.detail}</span>
        </div>
      )}
      {status.state === "ready" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          <LiveStat icon={Activity} label="Network" value={`${status.data.networkName} (${status.data.networkId})`} />
          <LiveStat icon={DatabaseZap} label="P-Chain height" value={status.data.pChainHeight} />
          <LiveStat icon={DatabaseZap} label="C-Chain block" value={status.data.cChainBlock} />
          <LiveStat icon={RadioTower} label="Validators" value={String(status.data.validatorCount)} />
        </div>
      )}
    </section>
  );
}

function LiveStat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="border-b border-r border-border p-4 last:border-r-0 lg:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <p className="axon-code text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <p className="mt-2 break-all text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
