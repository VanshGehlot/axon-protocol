import { ArrowRight, Boxes, KeyRound, Link2, Network, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";
import { AvalancheLiveStatus } from "@/components/AvalancheLiveStatus";
import { SiteNav } from "@/components/SiteNav";
import { FUJI_CONFIG } from "@/lib/axon";

const stack = [
  {
    title: "Fuji testnet by default",
    body: "Every current deployment path stays on Fuji while signer, funding, and validator assumptions are still being reviewed.",
    icon: Network,
  },
  {
    title: "SubnetEVM first",
    body: "Axon defaults to SubnetEVM because it gives EVM teams the shortest path from existing contracts to an Avalanche L1.",
    icon: Boxes,
  },
  {
    title: "ACP-267-aware ops",
    body: "The monitor flags validator uptime below the 90% threshold and turns raw status into operator action.",
    icon: ShieldCheck,
  },
  {
    title: "Core Wallet surface",
    body: "Wallet auth is designed around connect, sign message, review config, then authorize deployment.",
    icon: WalletCards,
  },
  {
    title: "PlatformVM boundary",
    body: "The mock deploy endpoint preserves the final API shape so a real PlatformVM signer can replace the receipt generator.",
    icon: KeyRound,
  },
  {
    title: "dApp support layer",
    body: "The SDK widget lets launched chains embed an Axon agent directly into their application experience.",
    icon: Link2,
  },
];

const apiNotes = [
  ["C-Chain RPC", FUJI_CONFIG.rpcUrl],
  ["P-Chain API", FUJI_CONFIG.subnetApiUrl],
  ["Info API", FUJI_CONFIG.infoApiUrl],
  ["Explorer", FUJI_CONFIG.explorerUrl],
  ["Faucet", FUJI_CONFIG.avaxFaucet],
];

export default function AvalanchePage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="axon-code text-xs uppercase tracking-[0.22em] text-accent">Avalanche alignment</p>
            <h1 className="mt-4 font-heading text-5xl font-semibold leading-tight">
              Built around the way Avalanche L1 teams actually ship
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted">
              Axon is not just a chat wrapper. It is a control-plane pattern for Avalanche L1 deployment: collect
              requirements, produce a reviewable config, isolate the signer boundary, and keep validator operations in
              view after launch.
            </p>
            <Link
              href="/demo"
              className="mt-7 inline-flex h-11 items-center gap-2 border border-accent bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent/90"
            >
              Run judge demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <section className="axon-panel">
            <div className="border-b border-border p-4">
              <p className="axon-code text-xs uppercase tracking-[0.16em] text-muted">Fuji integration map</p>
            </div>
            <div className="divide-y divide-border">
              {apiNotes.map(([label, value]) => (
                <div key={label} className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]">
                  <p className="axon-code text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
                  <p className="break-all text-sm text-zinc-200">{value}</p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <AvalancheLiveStatus />
        </section>

        <section className="border-y border-border bg-panel/70">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
            {stack.map((item) => (
              <article key={item.title} className="border border-border bg-background p-5 transition hover:border-accent/60">
                <item.icon className="h-5 w-5 text-accent" />
                <h2 className="mt-5 font-heading text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="axon-panel p-5">
            <p className="axon-code text-xs uppercase tracking-[0.18em] text-accent">Next production step</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold">Replace the mock deployer with a signer service</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              The app already separates config generation, deployment request, and monitor provider behavior. The
              production move is to connect Core Wallet authentication, validate funding, then send the PlatformVM
              transaction from a signer service with explicit user approval.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
