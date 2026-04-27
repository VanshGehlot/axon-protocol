"use client";

import { useMemo, useState } from "react";
import { Check, KeyRound, PlugZap, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type WalletConnectProps = {
  compact?: boolean;
  onAddressChange?: (address: string) => void;
};

function makeMockAddress() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function WalletConnect({ compact = false, onAddressChange }: WalletConnectProps) {
  const [address, setAddress] = useState("");
  const shortAddress = useMemo(() => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""), [address]);

  function connect() {
    const nextAddress = makeMockAddress();
    setAddress(nextAddress);
    onAddressChange?.(nextAddress);
  }

  return (
    <button
      type="button"
      onClick={connect}
      className={cn(
        "inline-flex h-10 items-center gap-2 border border-border px-3 text-sm text-foreground transition hover:border-accent hover:text-white",
        address && "border-accent/50 bg-accent/10",
        compact && "h-9 px-2.5 text-xs",
      )}
      title={address ? `Connected and demo-signed ${address}` : "Connect Core Wallet and sign Axon demo message"}
    >
      {address ? <Check className="h-4 w-4 text-success" /> : <Wallet className="h-4 w-4" />}
      <span className="hidden sm:inline">{address ? `${shortAddress} signed` : "Connect Core"}</span>
      {!address && <PlugZap className="h-3.5 w-3.5 text-accent" />}
      {address && <KeyRound className="h-3.5 w-3.5 text-accent" />}
    </button>
  );
}
