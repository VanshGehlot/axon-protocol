"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, RadioTower, RefreshCw, ShieldCheck } from "lucide-react";
import type { DeploymentReadiness, DeploymentReadinessItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type DeploymentReadinessPanelProps = {
  walletAddress?: string;
};

export function DeploymentReadinessPanel({ walletAddress }: DeploymentReadinessPanelProps) {
  const [readiness, setReadiness] = useState<DeploymentReadiness>();
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = walletAddress ? `?walletAddress=${encodeURIComponent(walletAddress)}` : "";
      const response = await fetch(`/api/deploy/readiness${params}`, { cache: "no-store" });
      const nextReadiness = (await response.json()) as DeploymentReadiness;
      setReadiness(nextReadiness);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <section className="axon-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="axon-code text-[11px] uppercase tracking-[0.18em] text-accent">Broadcast readiness</p>
          <h2 className="mt-1 font-heading text-xl font-semibold">Fuji deployment gate</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {readiness?.summary ??
              "Checking whether this environment can move from reviewed L1 config to a live PlatformVM broadcast."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-medium text-muted transition hover:border-accent hover:text-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          Recheck
        </button>
      </div>

      <div className="grid gap-3 py-4 lg:grid-cols-3">
        <ReadinessStat
          icon={RadioTower}
          label="Network"
          value={readiness?.network ? `${readiness.network.networkName} (${readiness.network.networkId})` : "Checking"}
        />
        <ReadinessStat
          icon={ShieldCheck}
          label="Broadcast mode"
          value={readiness?.canBroadcast ? "Live enabled" : "Preflight only"}
        />
        <ReadinessStat
          icon={Clock3}
          label="Checked"
          value={readiness ? new Date(readiness.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "..."}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {(readiness?.items ?? fallbackItems).map((item) => (
          <ReadinessItemCard key={item.id} item={item} />
        ))}
      </div>

      {readiness && (
        <div className="mt-4 border border-border bg-background/70 p-3 text-sm text-muted">
          <span className="font-medium text-foreground">Next production move:</span> {readiness.nextAction}
        </div>
      )}
    </section>
  );
}

const fallbackItems: DeploymentReadinessItem[] = [
  { id: "loading", label: "Loading readiness", status: "pending", detail: "Fetching current Fuji and signer status." },
];

function ReadinessItemCard({ item }: { item: DeploymentReadinessItem }) {
  const tone =
    item.status === "ready"
      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300"
      : item.status === "blocked"
        ? "border-accent/50 bg-accent/10 text-accent"
        : "border-border bg-background/70 text-muted";
  const Icon = item.status === "ready" ? CheckCircle2 : item.status === "blocked" ? AlertTriangle : Clock3;

  return (
    <article className={cn("min-h-36 border p-3", tone)}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <p className="font-medium text-foreground">{item.label}</p>
      </div>
      <p className="axon-code mt-3 text-[10px] uppercase tracking-[0.16em]">{item.status}</p>
      <p className="mt-2 text-xs leading-5 text-muted">{item.detail}</p>
    </article>
  );
}

function ReadinessStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof RadioTower;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border border-border bg-background/70 p-3">
      <div className="grid h-9 w-9 place-items-center border border-border text-accent">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="axon-code text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
