import { Copy, PackageCheck } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";

const snippet = `import { AxonWidget } from '@axon-protocol/sdk'

export function App() {
  return (
    <AxonWidget
      apiKey="your-axon-api-key"
      chainId="your-deployed-chain-id"
      theme="dark"
    />
  )
}`;

export default function SdkPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="axon-code text-xs uppercase tracking-[0.24em] text-accent">AxonSDK</p>
            <h1 className="mt-4 font-heading text-5xl font-semibold leading-tight">Embed Axon in any Avalanche dApp</h1>
            <p className="mt-5 text-lg leading-8 text-muted">
              The SDK renders a floating chat agent that can explain gas, guide wallet connection, and answer questions
              about the host chain.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 border border-border bg-panel px-4 py-3">
              <PackageCheck className="h-5 w-5 text-accent" />
              <code className="axon-code text-sm">npm install @axon-protocol/sdk</code>
            </div>
          </div>
          <section className="axon-panel">
            <div className="flex h-12 items-center justify-between border-b border-border px-4">
              <span className="axon-code text-xs text-muted">React embed</span>
              <button className="inline-flex h-8 items-center gap-2 border border-border px-2 text-xs text-muted">
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
            <pre className="axon-code overflow-auto p-5 text-sm leading-7 text-zinc-200">{snippet}</pre>
          </section>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Widget config", "POST /api/sdk/widget-config validates API keys and returns chain-aware options."],
            ["Host chain Q&A", "The widget sends user questions with chainId context for concise support answers."],
            ["Wallet guidance", "Projects can wire Core Wallet connection flows around the widget events."],
          ].map(([title, body]) => (
            <article key={title} className="border border-border bg-panel p-5">
              <h2 className="font-heading text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
