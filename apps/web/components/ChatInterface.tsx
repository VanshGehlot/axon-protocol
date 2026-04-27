"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowUp, Bot, CheckCircle2, Loader2, RadioTower, Rocket, ShieldCheck, UserRound } from "lucide-react";
import { ConfigPreview } from "@/components/ConfigPreview";
import { DeploymentReadinessPanel } from "@/components/DeploymentReadinessPanel";
import { DeploymentHistory, writeLocalDeployment } from "@/components/DeploymentHistory";
import { WalletConnect } from "@/components/WalletConnect";
import type { AgentChatResponse, DeploymentRecord, DeploymentResult, L1Config } from "@/lib/types";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const starter = "I want a gaming L1 with 5 validators, AVAX as gas token, and 1000 TPS target";

const promptShortcuts = [
  "A DeFi L1 with permissioned validators and AVAX gas",
  "A high-throughput gaming chain with public access",
  "Check validator uptime for my Fuji chain",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Tell me what you want to launch. I will turn it into a Fuji-ready Avalanche L1 spec and call out the tradeoffs before deployment.",
    },
  ]);
  const [input, setInput] = useState(starter);
  const [walletAddress, setWalletAddress] = useState("");
  const [config, setConfig] = useState<L1Config | undefined>();
  const [deployment, setDeployment] = useState<DeploymentResult | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useMemo(() => `sess_${Math.random().toString(16).slice(2)}`, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId, walletAddress }),
      });
      const data = (await response.json()) as AgentChatResponse;
      if (data.config) setConfig(data.config);
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);

      if (data.action === "DEPLOY" && config) {
        await deploy(config);
      }
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "I could not reach the Axon agent endpoint. Check the dev server logs and try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function deploy(activeConfig = config) {
    if (!activeConfig || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/deploy/l1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: activeConfig, walletAddress }),
      });
      const result = (await response.json()) as DeploymentResult;
      setDeployment(result);
      const record: DeploymentRecord = {
        id: `dep_${result.txHash.slice(2, 10)}`,
        config: activeConfig,
        result,
        walletAddress: walletAddress || activeConfig.feeRecipient,
        createdAt: new Date().toISOString(),
      };
      writeLocalDeployment(record);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.networkPreflight
            ? `Fuji deploy rehearsal complete after live SDK preflight on ${result.networkPreflight.networkName}. Chain ID: ${result.chainId}. RPC: ${result.rpcUrl}. Explorer: ${result.explorerUrl}.`
            : `Fuji deploy rehearsal complete. Chain ID: ${result.chainId}. RPC: ${result.rpcUrl}. Explorer: ${result.explorerUrl}.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DeploymentReadinessPanel walletAddress={walletAddress} />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
        <section className="axon-panel flex min-h-[640px] flex-col">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-4">
          <div>
            <p className="axon-code text-[11px] uppercase tracking-[0.18em] text-accent">AxonDeploy</p>
            <h1 className="font-heading text-lg font-semibold">Fuji deployment room</h1>
          </div>
          <WalletConnect compact onAddressChange={setWalletAddress} />
        </div>
        <div className="grid border-b border-border bg-background/70 sm:grid-cols-3">
          <Signal icon={RadioTower} label="Network" value="Fuji testnet" />
          <Signal icon={ShieldCheck} label="Guardrail" value="Review before sign" />
          <Signal icon={CheckCircle2} label="Mode" value="Live preflight" />
        </div>
        <div className="flex-1 space-y-4 overflow-auto p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn("flex gap-3", message.role === "user" && "justify-end")}
            >
              {message.role === "assistant" && (
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center border border-accent/50 bg-accent/10 text-accent">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[82%] border border-border px-4 py-3 text-sm leading-6",
                  message.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-panel2 text-zinc-200 shadow-[inset_2px_0_0_rgba(232,65,66,0.7)]",
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center border border-border bg-panel2 text-muted">
                  <UserRound className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
        {deployment && (
          <div className="border-t border-border bg-accent/10 px-4 py-3 text-sm">
            <span className="axon-code text-accent">REHEARSAL RECEIPT</span>{" "}
            <span className="text-zinc-200">{deployment.rpcUrl}</span>
          </div>
        )}
        <form onSubmit={submit} className="border-t border-border p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-12 flex-1 resize-none border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
              placeholder="Describe your L1..."
            />
            <button
              type="submit"
              disabled={isLoading}
              className="grid h-12 w-12 shrink-0 place-items-center border border-accent bg-accent text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
              title="Send message"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {promptShortcuts.map((shortcut) => (
              <button
                key={shortcut}
                type="button"
                onClick={() => setInput(shortcut)}
                className="border border-border px-2.5 py-1.5 text-left text-xs text-muted transition hover:border-accent hover:text-foreground"
              >
                {shortcut}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted">Review the config, then run the Fuji deploy rehearsal with live preflight.</p>
            <button
              type="button"
              disabled={!config || isLoading}
              onClick={() => deploy()}
              className="inline-flex h-9 items-center gap-2 border border-accent px-3 text-xs font-medium text-accent transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:border-border disabled:text-muted"
            >
              <Rocket className="h-3.5 w-3.5" />
              Run Rehearsal
            </button>
          </div>
        </form>
        </section>
        <ConfigPreview config={config} />
      </div>
      <DeploymentHistory />
    </>
  );
}

function Signal({ icon: Icon, label, value }: { icon: typeof RadioTower; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-r border-border p-3 last:border-r-0 sm:border-b-0">
      <div className="grid h-8 w-8 place-items-center border border-border text-accent">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="axon-code text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
