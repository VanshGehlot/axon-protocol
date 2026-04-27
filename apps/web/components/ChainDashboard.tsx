"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Gauge, ListChecks, RadioTower, RefreshCw, ShieldCheck } from "lucide-react";
import { ValidatorCard } from "@/components/ValidatorCard";
import type { ChainHealth } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChainDashboard({ initialHealth }: { initialHealth: ChainHealth }) {
  const [health, setHealth] = useState(initialHealth);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const belowThreshold = useMemo(
    () => health.validators.filter((validator) => !validator.compliant).length,
    [health.validators],
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/monitor/chain/${health.chainId}`, { cache: "no-store" });
      setHealth((await response.json()) as ChainHealth);
    } finally {
      setIsRefreshing(false);
    }
  }, [health.chainId]);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const statusCopy =
    health.complianceStatus === "green"
      ? "All validators satisfy ACP-267 uptime."
      : health.complianceStatus === "yellow"
        ? "One validator needs attention."
        : "Multiple validators are below threshold.";

  return (
    <div className="space-y-5">
      <section className="axon-panel p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="axon-code text-[11px] uppercase tracking-[0.18em] text-accent">AxonMonitor</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold">Operator view for {health.chainName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {statusCopy} This page is written for the person who gets paged when validator health drifts.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="border border-border px-2.5 py-1.5 text-muted">
                Source: {health.source === "avalanche-sdk" ? "live Avalanche SDK" : "mock fallback"}
              </span>
              {health.networkName && (
                <span className="border border-border px-2.5 py-1.5 text-muted">
                  Network: {health.networkName} ({health.networkId})
                </span>
              )}
              {health.pChainHeight && (
                <span className="border border-border px-2.5 py-1.5 text-muted">P-Chain height: {health.pChainHeight}</span>
              )}
            </div>
            {health.fallbackReason && (
              <p className="mt-3 max-w-2xl text-xs leading-5 text-warning">
                Live Fuji request failed, showing fallback data: {health.fallbackReason}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-10 items-center gap-2 border border-border px-3 text-sm transition hover:border-accent hover:text-accent"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <Metric icon={Gauge} label="Current TPS" value={health.tps.toLocaleString()} />
          <Metric icon={Activity} label="Avg block time" value={`${health.blockTime.toFixed(1)}s`} />
          <Metric icon={RadioTower} label="Tx 24h" value={health.txCount24h.toLocaleString()} />
          <Metric icon={AlertTriangle} label="Validators flagged" value={String(belowThreshold)} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 md:grid-cols-2">
          {health.validators.map((validator) => (
            <ValidatorCard key={validator.nodeId} validator={validator} />
          ))}
        </div>
        <aside className="axon-panel p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <h2 className="font-heading text-xl font-semibold">Agent summary</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {belowThreshold === 0
              ? "Validator set is healthy. Maintain the current operator rotation and continue five-minute polling."
              : `${belowThreshold} validator${belowThreshold > 1 ? "s are" : " is"} below 90% uptime. Check node process health, peer connectivity, and staking window before adding capacity.`}
          </p>
          <div className="mt-5 border border-border bg-background/70 p-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-accent" />
              <p className="axon-code text-xs uppercase tracking-[0.14em] text-muted">Action queue</p>
            </div>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <p>1. Confirm the below-threshold node has current peers and no missed staking window.</p>
              <p>2. Keep the validator set unchanged until the next polling cycle confirms recovery.</p>
              <p>3. Export the snapshot before changing operators or weights.</p>
            </div>
          </div>
          <div className="mt-5 border border-border p-4">
            <p className="axon-code text-xs uppercase tracking-[0.14em] text-muted">Gas trend nAVAX</p>
            <div className="mt-4 flex h-24 items-end gap-2">
              {health.gasPriceTrend.map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  className="flex-1 bg-accent/80"
                  style={{ height: `${Math.max(18, value * 2)}%` }}
                  title={`${value} nAVAX`}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="border border-border p-3">
              <p className="axon-code text-xs text-muted">ICM messages</p>
              <p className="mt-2 text-xl font-semibold">{health.icmMessageCount.toLocaleString()}</p>
            </div>
            <div className="border border-border p-3">
              <p className="axon-code text-xs text-muted">Chain ID</p>
              <p className="mt-2 text-xl font-semibold">{health.chainId}</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="border border-border bg-panel2 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="axon-code text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}
