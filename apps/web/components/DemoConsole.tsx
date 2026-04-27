"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  FileJson2,
  Loader2,
  Play,
  RadioTower,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { writeLocalDeployment } from "@/components/DeploymentHistory";
import type { AgentChatResponse, ChainHealth, DeploymentRecord, DeploymentResult, L1Config } from "@/lib/types";

const demoPrompt = "I want a gaming L1 with 5 validators, AVAX as gas token, and 1000 TPS target";
const demoWallet = "0x1111111111111111111111111111111111111111";

export function DemoConsole() {
  const [config, setConfig] = useState<L1Config>();
  const [deployment, setDeployment] = useState<DeploymentResult>();
  const [health, setHealth] = useState<ChainHealth>();
  const [activeStep, setActiveStep] = useState<"idle" | "config" | "deploy" | "monitor">("idle");
  const [isRunning, setIsRunning] = useState(false);

  async function generateConfig() {
    setActiveStep("config");
    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: demoPrompt, sessionId: "demo", walletAddress: demoWallet }),
    });
    const data = (await response.json()) as AgentChatResponse;
    if (data.config) setConfig(data.config);
    return data.config;
  }

  async function deployConfig(nextConfig = config) {
    if (!nextConfig) return undefined;
    setActiveStep("deploy");
    const response = await fetch("/api/deploy/l1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: nextConfig, walletAddress: demoWallet }),
    });
    const result = (await response.json()) as DeploymentResult;
    setDeployment(result);
    const record: DeploymentRecord = {
      id: `dep_${result.txHash.slice(2, 10)}`,
      config: nextConfig,
      result,
      walletAddress: demoWallet,
      createdAt: new Date().toISOString(),
    };
    writeLocalDeployment(record);
    return result;
  }

  async function loadMonitor(result = deployment) {
    if (!result) return;
    setActiveStep("monitor");
    const response = await fetch(`/api/monitor/chain/${result.chainId}`, { cache: "no-store" });
    setHealth((await response.json()) as ChainHealth);
  }

  async function runFullDemo() {
    setIsRunning(true);
    try {
      const nextConfig = await generateConfig();
      const result = await deployConfig(nextConfig);
      await loadMonitor(result);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="axon-panel p-5">
        <p className="axon-code text-[11px] uppercase tracking-[0.18em] text-accent">Judge walkthrough</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight">One click from idea to monitored L1</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          This demo runs the core Axon story in sequence: natural-language config generation with live Fuji validator
          candidates, deploy rehearsal with SDK preflight, and operator health review.
        </p>
        <button
          type="button"
          onClick={runFullDemo}
          disabled={isRunning}
          className="mt-6 inline-flex h-11 items-center gap-2 border border-accent bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run full demo
        </button>
        <div className="mt-6 space-y-3">
          <Step
            icon={FileJson2}
            title="Generate config"
            body="Parse the product intent into a Fuji-ready SubnetEVM configuration."
            active={activeStep === "config"}
            complete={Boolean(config)}
          />
          <Step
            icon={Rocket}
            title="Run rehearsal"
            body="Create a gated Fuji receipt only after live network preflight returns."
            active={activeStep === "deploy"}
            complete={Boolean(deployment)}
          />
          <Step
            icon={Activity}
            title="Monitor health"
            body="Load validator uptime and ACP-267 status through the monitor provider boundary."
            active={activeStep === "monitor"}
            complete={Boolean(health)}
          />
        </div>
      </section>

      <section className="axon-panel overflow-hidden">
        <div className="grid border-b border-border sm:grid-cols-3">
          <ResultStat label="Config" value={config ? config.chainName : "Pending"} />
          <ResultStat label="Chain ID" value={deployment?.chainId ?? "Pending"} />
          <ResultStat label="Compliance" value={health?.complianceStatus ?? "Pending"} />
        </div>
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
            <p className="axon-code text-xs uppercase tracking-[0.16em] text-muted">Live output</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
              <p>Prompt: {demoPrompt}</p>
              <p>Wallet: {demoWallet}</p>
              <p>RPC: {deployment?.rpcUrl ?? "Run the demo to create a Fuji rehearsal RPC."}</p>
              <p>
                Monitor:{" "}
                {health
                  ? `${health.validators.filter((validator) => !validator.compliant).length} validator flagged`
                  : "Waiting for chain health."}
              </p>
            </div>
          </div>
          <pre className="axon-code max-h-[520px] overflow-auto p-5 text-xs leading-6 text-zinc-300">
            {JSON.stringify({ config, deployment, health }, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}

function Step({
  icon: Icon,
  title,
  body,
  active,
  complete,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <article className={`border p-4 ${active || complete ? "border-accent/60 bg-accent/10" : "border-border bg-background/70"}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center border border-border text-accent">
          {complete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
        </div>
      </div>
    </article>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-border p-4 last:border-r-0 sm:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <p className="axon-code text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
        <RadioTower className="h-4 w-4 text-accent" />
      </div>
      <p className="mt-2 truncate text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}
