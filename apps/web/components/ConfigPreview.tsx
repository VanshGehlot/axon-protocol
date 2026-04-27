import { Copy, FileJson2, Gauge, ShieldCheck, WalletCards } from "lucide-react";
import type { L1Config } from "@/lib/types";

type ConfigPreviewProps = {
  config?: L1Config;
};

export function ConfigPreview({ config }: ConfigPreviewProps) {
  return (
    <section className="axon-panel flex min-h-[520px] flex-col">
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FileJson2 className="h-4 w-4 text-accent" />
          Deployment review
        </div>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-2 border border-border px-2 text-xs text-muted transition hover:border-accent hover:text-foreground"
          title="Copy config"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
      {config ? (
        <>
          <div className="grid border-b border-border bg-background/70 sm:grid-cols-3">
            <ReviewMetric icon={Gauge} label="Target TPS" value={String(config.tpsTarget)} />
            <ReviewMetric icon={ShieldCheck} label="Access" value={config.permissions} />
            <ReviewMetric icon={WalletCards} label="Gas" value={config.gasToken} />
          </div>
          <div className="border-b border-border p-4">
            <p className="axon-code text-[11px] uppercase tracking-[0.16em] text-muted">Preflight notes</p>
            <div className="mt-3 grid gap-2 text-sm text-zinc-300">
              <p>Validator set: {config.validators.length} Fuji public validators selected for testnet review.</p>
              <p>Fee recipient: {config.feeRecipient || "Connect Core Wallet before signing."}</p>
              <p>Gas envelope: {config.gasLimit.toLocaleString()} gas limit with {config.minBaseFee} minimum base fee.</p>
            </div>
          </div>
          <pre className="axon-code flex-1 overflow-auto p-4 text-xs leading-6 text-zinc-200">
            {JSON.stringify(config, null, 2)}
          </pre>
        </>
      ) : (
        <div className="grid flex-1 place-items-center p-6 text-center">
          <div>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center border border-border bg-panel2 text-muted">
              <FileJson2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">Awaiting chain intent</p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Axon will derive validators, gas settings, chain ID, permissions, and review notes before anything deploys.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function ReviewMetric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="border-b border-r border-border p-3 last:border-r-0 sm:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <p className="axon-code text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <p className="mt-2 text-sm font-semibold capitalize text-foreground">{value}</p>
    </div>
  );
}
