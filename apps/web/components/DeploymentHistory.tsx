"use client";

import { useEffect, useState } from "react";
import { Clock3, ExternalLink, History, RadioTower } from "lucide-react";
import type { DeploymentRecord } from "@/lib/types";

const storageKey = "axon.deployments";

export function readLocalDeployments(): DeploymentRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as DeploymentRecord[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalDeployment(record: DeploymentRecord) {
  if (typeof window === "undefined") return;
  const next = [record, ...readLocalDeployments().filter((item) => item.id !== record.id)].slice(0, 8);
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("axon:deployments-updated"));
}

export function DeploymentHistory() {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);

  useEffect(() => {
    function load() {
      setDeployments(readLocalDeployments());
    }

    load();
    window.addEventListener("axon:deployments-updated", load);
    return () => window.removeEventListener("axon:deployments-updated", load);
  }, []);

  return (
    <section className="axon-panel mt-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-xl font-semibold">Saved mock deployments</h2>
        </div>
        <span className="axon-code text-xs text-muted">{deployments.length} local</span>
      </div>
      {deployments.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          Deploy a mock Fuji receipt and it will appear here, ready for demos and reviewer walkthroughs.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {deployments.map((deployment) => (
            <article key={deployment.id} className="border border-border bg-background/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-heading text-lg font-semibold">{deployment.config.chainName}</p>
                  <p className="axon-code mt-1 truncate text-xs text-muted">{deployment.result.subnetId}</p>
                </div>
                <RadioTower className="h-5 w-5 shrink-0 text-accent" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <MiniStat label="Chain" value={deployment.result.chainId} />
                <MiniStat label="TPS" value={String(deployment.config.tpsTarget)} />
                <MiniStat label="Gas" value={deployment.config.gasToken} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {new Date(deployment.createdAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <a
                  href={deployment.result.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-accent"
                >
                  Explorer
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-2">
      <p className="axon-code text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 truncate font-semibold text-foreground">{value}</p>
    </div>
  );
}
