import { FormEvent, useEffect, useMemo, useState } from "react";

export type AxonWidgetTheme = "dark" | "light";

export type AxonWidgetProps = {
  apiKey: string;
  chainId: string;
  theme?: AxonWidgetTheme;
  endpoint?: string;
  title?: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

type WidgetConfig = {
  agentName: string;
  endpoint: string;
  capabilities: string[];
};

const dark = {
  background: "#0A0A0A",
  panel: "#111111",
  text: "#F7F7F7",
  muted: "#A1A1AA",
  border: "rgba(255,255,255,0.14)",
  accent: "#E84142",
};

const light = {
  background: "#FFFFFF",
  panel: "#F6F6F6",
  text: "#111111",
  muted: "#52525B",
  border: "rgba(0,0,0,0.14)",
  accent: "#E84142",
};

export function AxonWidget({ apiKey, chainId, theme = "dark", endpoint = "/api/sdk/widget-config", title = "Axon" }: AxonWidgetProps) {
  const palette = theme === "dark" ? dark : light;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [config, setConfig] = useState<WidgetConfig>();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ask me about this Avalanche chain, gas fees, wallet setup, or your first transaction.",
    },
  ]);
  const sessionId = useMemo(() => `widget_${Math.random().toString(16).slice(2)}`, []);

  useEffect(() => {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, chainId }),
    })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((data) => setConfig(data?.config))
      .catch(() => {
        setConfig({
          agentName: title,
          endpoint: "/api/agent/chat",
          capabilities: ["chain-qna"],
        });
      });
  }, [apiKey, chainId, endpoint, title]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;
    setMessages((current) => [...current, { role: "user", content: value }]);
    setInput("");

    try {
      const response = await fetch(config?.endpoint || "/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `For chain ${chainId}: ${value}`,
          sessionId,
        }),
      });
      const data = (await response.json()) as { reply?: string };
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply || "I could not answer that yet. Try asking about gas, wallets, or chain health." },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "The Axon agent endpoint is unreachable from this dApp." },
      ]);
    }
  }

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 2147483640, fontFamily: "Inter, system-ui, sans-serif" }}>
      {isOpen && (
        <section
          style={{
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            height: 520,
            maxHeight: "calc(100vh - 110px)",
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            background: palette.background,
            color: palette.text,
            border: `1px solid ${palette.border}`,
            boxShadow: "0 22px 70px rgba(0,0,0,0.34)",
          }}
        >
          <header style={{ padding: "14px 16px", borderBottom: `1px solid ${palette.border}` }}>
            <strong>{config?.agentName || title}</strong>
            <div style={{ marginTop: 4, color: palette.muted, fontSize: 12 }}>Chain {chainId}</div>
          </header>
          <div style={{ flex: 1, overflow: "auto", padding: 14, display: "grid", alignContent: "start", gap: 10 }}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  justifySelf: message.role === "user" ? "end" : "start",
                  maxWidth: "86%",
                  padding: "10px 12px",
                  fontSize: 13,
                  lineHeight: 1.45,
                  background: message.role === "user" ? palette.accent : palette.panel,
                  color: message.role === "user" ? "#fff" : palette.text,
                  border: `1px solid ${message.role === "user" ? palette.accent : palette.border}`,
                }}
              >
                {message.content}
              </div>
            ))}
          </div>
          <form onSubmit={submit} style={{ display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${palette.border}` }}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Axon..."
              style={{
                minWidth: 0,
                flex: 1,
                height: 40,
                padding: "0 10px",
                color: palette.text,
                background: palette.panel,
                border: `1px solid ${palette.border}`,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                height: 40,
                width: 44,
                border: 0,
                color: "#fff",
                background: palette.accent,
                cursor: "pointer",
              }}
              aria-label="Send"
            >
              ^
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        style={{
          height: 56,
          minWidth: 56,
          padding: "0 18px",
          border: `1px solid ${palette.accent}`,
          background: palette.accent,
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
        aria-expanded={isOpen}
      >
        {isOpen ? "Close" : "Axon"}
      </button>
    </div>
  );
}
