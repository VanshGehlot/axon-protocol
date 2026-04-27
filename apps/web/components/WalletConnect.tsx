"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, KeyRound, Loader2, PlugZap, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type WalletConnectProps = {
  compact?: boolean;
  onAddressChange?: (address: string) => void;
};

type EthereumProvider = {
  isAvalanche?: boolean;
  isCore?: boolean;
  request<T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<T>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const fujiChainId = "0xa869";

export function WalletConnect({ compact = false, onAddressChange }: WalletConnectProps) {
  const [address, setAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const shortAddress = useMemo(() => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""), [address]);
  const isSigned = Boolean(address && signature);

  async function connect() {
    setError("");
    const provider = window.ethereum;

    if (!provider) {
      setError("Install Core Wallet or another injected wallet to sign in.");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await provider.request<string[]>({ method: "eth_requestAccounts" });
      const nextAddress = accounts[0];
      if (!nextAddress) throw new Error("No wallet account returned.");

      await switchToFuji(provider);
      const message = [
        "Sign in to Axon Protocol",
        `Wallet: ${nextAddress}`,
        "Network: Avalanche Fuji",
        `Issued: ${new Date().toISOString()}`,
      ].join("\n");
      const nextSignature = await provider.request<string>({
        method: "personal_sign",
        params: [message, nextAddress],
      });

      setAddress(nextAddress);
      setSignature(nextSignature);
      onAddressChange?.(nextAddress);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Wallet connection failed.");
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={connect}
        disabled={isConnecting}
        className={cn(
          "inline-flex h-10 items-center gap-2 border border-border px-3 text-sm text-foreground transition hover:border-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-70",
          isSigned && "border-accent/50 bg-accent/10",
          error && "border-accent/70",
          compact && "h-9 px-2.5 text-xs",
        )}
        title={isSigned ? `Connected and signed ${address}` : "Connect Core Wallet and sign an Axon auth message"}
      >
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
        ) : isSigned ? (
          <Check className="h-4 w-4 text-success" />
        ) : error ? (
          <AlertTriangle className="h-4 w-4 text-accent" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isConnecting ? "Signing..." : isSigned ? `${shortAddress} signed` : "Connect Core"}
        </span>
        {!isSigned && !isConnecting && <PlugZap className="h-3.5 w-3.5 text-accent" />}
        {isSigned && <KeyRound className="h-3.5 w-3.5 text-accent" />}
      </button>
      {error && !compact && <p className="absolute right-0 mt-2 w-72 border border-accent/50 bg-background p-2 text-xs text-muted">{error}</p>}
    </div>
  );
}

async function switchToFuji(provider: EthereumProvider) {
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: fujiChainId }] });
  } catch (caught) {
    if (isWalletChainMissingError(caught)) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: fujiChainId,
            chainName: "Avalanche Fuji C-Chain",
            nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
            rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
            blockExplorerUrls: ["https://testnet.snowtrace.io"],
          },
        ],
      });
      return;
    }

    throw caught;
  }
}

function isWalletChainMissingError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && Number((error as { code: unknown }).code) === 4902;
}
