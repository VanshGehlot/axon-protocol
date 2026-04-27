import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import type { ValidatorMetric } from "@/lib/types";
import { cn, formatPct } from "@/lib/utils";

export function ValidatorCard({ validator }: { validator: ValidatorMetric }) {
  return (
    <article className="border border-border bg-panel p-4 transition hover:border-accent/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="axon-code truncate text-xs text-muted">{validator.nodeId}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{formatPct(validator.uptime)}</p>
        </div>
        <div
          className={cn(
            "grid h-9 w-9 place-items-center border",
            validator.compliant ? "border-success/60 text-success" : "border-warning/60 text-warning",
          )}
        >
          {validator.compliant ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </div>
      </div>
      <div className="mt-4 h-1.5 border border-border bg-background">
        <div
          className={cn("h-full", validator.compliant ? "bg-success" : "bg-warning")}
          style={{ width: `${Math.min(100, Math.max(0, validator.uptime))}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
        <span>{validator.compliant ? "ACP-267 compliant" : "Below 90% threshold"}</span>
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3 w-3" />
          {new Date(validator.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </article>
  );
}
