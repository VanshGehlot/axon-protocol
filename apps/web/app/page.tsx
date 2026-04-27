import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Code2,
  Cpu,
  Network,
  RadioTower,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";

const capabilities = [
  {
    title: "Spec from intent",
    body: "Turns a builder's chain idea into a reviewable SubnetEVM config with validators, fees, gas, access, and chain ID.",
    icon: Terminal,
  },
  {
    title: "Fuji first",
    body: "Keeps every deployment path testnet-safe while the signer boundary is isolated for real PlatformVM execution.",
    icon: Cpu,
  },
  {
    title: "Ops-grade monitor",
    body: "Watches validator uptime, block time, gas movement, ICM volume, and ACP-267 compliance without a CLI.",
    icon: Activity,
  },
  {
    title: "Agent in every dApp",
    body: "A lightweight widget gives chain teams an embedded support layer for gas, wallets, and first transactions.",
    icon: Code2,
  },
];

const operatorSignals = [
  ["Fuji Network", "Ready"],
  ["SubnetEVM", "Default VM"],
  ["ACP-267", "90% uptime guard"],
  ["Core Wallet", "Sign-in surface"],
];

const reviewTrail = [
  "Intent parsed: gaming L1, AVAX gas, 5 validators",
  "Fee policy set: 25 nAVAX minimum base fee",
  "Throughput target mapped to 42,000,000 gas limit",
  "Awaiting wallet confirmation before deployment",
];

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 border border-accent/50 bg-accent/10 px-3 py-2">
              <RadioTower className="h-4 w-4 text-accent" />
              <p className="axon-code text-xs uppercase tracking-[0.2em] text-accent">Fuji operator console</p>
            </div>
            <h1 className="mt-6 max-w-3xl font-heading text-5xl font-semibold leading-[1.02] tracking-normal text-foreground md:text-7xl">
              Launch an Avalanche L1 without losing operator control
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Axon is a deployment copilot for teams that want the speed of conversation and the discipline of an
              infrastructure review. Describe the chain, inspect the config, deploy to Fuji, then keep validators honest.
            </p>
            <div className="mt-7 grid max-w-2xl grid-cols-2 border border-border bg-panel/80 sm:grid-cols-4">
              {operatorSignals.map(([label, value]) => (
                <div key={label} className="border-b border-r border-border p-3 last:border-r-0 sm:border-b-0">
                  <p className="axon-code text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/deploy"
                className="inline-flex h-11 items-center gap-2 border border-accent bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                Start deploying
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex h-11 items-center gap-2 border border-border px-4 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
              >
                Run 60s demo
              </Link>
              <Link
                href="/monitor"
                className="inline-flex h-11 items-center gap-2 border border-border px-4 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
              >
                View monitor
              </Link>
            </div>
          </div>

          <div className="axon-panel overflow-hidden shadow-red">
            <div className="flex h-11 items-center justify-between border-b border-border px-4">
              <span className="axon-code text-xs text-muted">axon://fuji/preflight/gaming-l1</span>
              <span className="inline-flex items-center gap-2 text-xs text-success">
                <span className="h-2 w-2 bg-success" />
                Live review
              </span>
            </div>
            <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="border-b border-border bg-panel/60 p-5 lg:border-b-0 lg:border-r">
                <div className="space-y-3">
                  <Bubble role="user">I need a gaming L1 with 5 validators and 1000 TPS.</Bubble>
                  <Bubble role="agent">
                    I built a Fuji-ready spec. It uses SubnetEVM, AVAX gas, public access, and a validator set sized for
                    the target throughput.
                  </Bubble>
                  <Bubble role="agent">Review the JSON, then connect Core Wallet to sign the deployment.</Bubble>
                </div>
                <div className="mt-6 border border-border bg-background/70 p-4">
                  <p className="axon-code text-[11px] uppercase tracking-[0.16em] text-muted">Review trail</p>
                  <div className="mt-4 space-y-3">
                    {reviewTrail.map((item) => (
                      <div key={item} className="flex gap-3 text-sm text-zinc-300">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-background">
                <div className="grid grid-cols-3 border-b border-border text-center">
                  <Stat value="5" label="validators" />
                  <Stat value="1000" label="target TPS" />
                  <Stat value="25" label="nAVAX base" />
                </div>
                <pre className="axon-code overflow-hidden p-5 text-xs leading-6 text-zinc-300">
{`{
  "chainName": "Gaming Axon L1",
  "vmId": "SubnetEVM",
  "validators": 5,
  "gasToken": "AVAX",
  "tpsTarget": 1000,
  "permissions": "public",
  "status": "ready"
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-panel/70">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 lg:grid-cols-[0.76fr_1.24fr] lg:px-8">
            <div>
              <p className="axon-code text-xs uppercase tracking-[0.2em] text-accent">Why it matters</p>
              <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight">
                Avalanche L1s should feel easier to operate than cloud projects.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                The pitch is not just chat. It is an opinionated control plane that brings config generation,
                deployment review, validator monitoring, and embedded user support into one loop.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((capability) => (
              <article key={capability.title} className="border border-border bg-background p-5 transition hover:border-accent/60">
                <capability.icon className="h-5 w-5 text-accent" />
                <h2 className="mt-5 font-heading text-lg font-semibold">{capability.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{capability.body}</p>
              </article>
            ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <ProofPoint icon={Network} label="For builders" text="Move from idea to Fuji config without memorizing subnet commands." />
          <ProofPoint icon={ShieldCheck} label="For operators" text="Surface uptime risk, gas movement, and validator drift before it becomes user pain." />
          <ProofPoint icon={Code2} label="For ecosystems" text="Ship an agent widget that answers chain-specific questions inside the dApp." />
        </section>
      </main>
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "agent"; children: React.ReactNode }) {
  return (
    <div
      className={
        role === "user"
          ? "ml-auto max-w-[86%] bg-foreground p-3 text-sm text-background"
          : "max-w-[88%] border border-border bg-panel2 p-3 text-sm leading-6 text-zinc-200"
      }
    >
      {children}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-r border-border p-4 last:border-r-0">
      <p className="font-heading text-2xl font-semibold">{value}</p>
      <p className="axon-code mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

function ProofPoint({ icon: Icon, label, text }: { icon: typeof Network; label: string; text: string }) {
  return (
    <article className="border border-border bg-panel p-5">
      <Icon className="h-5 w-5 text-accent" />
      <h3 className="mt-5 font-heading text-lg font-semibold">{label}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
    </article>
  );
}
