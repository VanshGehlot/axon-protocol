import { getAvalancheNetworkSnapshot } from "@/lib/avalanche-live";
import type { DeploymentReadiness, DeploymentReadinessItem } from "@/lib/types";

function envEnabled(name: string) {
  return process.env[name] === "true" || process.env[name] === "1";
}

export async function getDeploymentReadiness(walletAddress?: string): Promise<DeploymentReadiness> {
  const checkedAt = new Date().toISOString();
  const liveMode = envEnabled("AXON_ENABLE_LIVE_DEPLOYMENTS");
  const signerServiceConfigured = Boolean(process.env.AXON_SIGNER_SERVICE_URL);
  const platformTxBuilderConfigured = Boolean(process.env.AXON_PLATFORM_TX_BUILDER_URL);
  const fundingGuardConfigured = envEnabled("AXON_ENABLE_FUNDING_GUARD");
  const hasWallet = Boolean(walletAddress);
  const items: DeploymentReadinessItem[] = [];
  let network: Awaited<ReturnType<typeof getAvalancheNetworkSnapshot>> | undefined;

  try {
    network = await getAvalancheNetworkSnapshot();

    items.push({
      id: "fuji-preflight",
      label: "Fuji SDK preflight",
      status: "ready",
      detail: `${network.networkName} (${network.networkId}) is reachable with ${network.validatorCount} active validators.`,
    });
  } catch (error) {
    items.push({
      id: "fuji-preflight",
      label: "Fuji SDK preflight",
      status: "blocked",
      detail: error instanceof Error ? error.message : "Avalanche SDK preflight failed.",
    });
  }

  items.push(
    {
      id: "wallet",
      label: "Core Wallet signer",
      status: hasWallet ? "ready" : "pending",
      detail: hasWallet
        ? `Fee recipient is bound to ${walletAddress}.`
        : "Connect Core Wallet before moving from config review to transaction signing.",
    },
    {
      id: "signer-service",
      label: "Server signer boundary",
      status: signerServiceConfigured ? "ready" : liveMode ? "blocked" : "pending",
      detail: signerServiceConfigured
        ? "AXON_SIGNER_SERVICE_URL is configured."
        : "Add a signer service that prepares and submits PlatformVM transactions after user approval.",
    },
    {
      id: "funding-guard",
      label: "Funding guard",
      status: fundingGuardConfigured ? "ready" : liveMode ? "blocked" : "pending",
      detail: fundingGuardConfigured
        ? "Funding guard is enabled."
        : "Add balance checks for AVAX fees and any validator staking requirements before broadcast.",
    },
    {
      id: "platform-tx",
      label: "PlatformVM transaction builder",
      status: platformTxBuilderConfigured ? "ready" : liveMode ? "blocked" : "pending",
      detail: platformTxBuilderConfigured
        ? "PlatformVM transaction builder is configured."
        : "Wire the reviewed L1 config into the Avalanche transaction creation flow.",
    },
  );

  const networkReady = items.find((item) => item.id === "fuji-preflight")?.status === "ready";
  const canBroadcast =
    liveMode && networkReady && hasWallet && signerServiceConfigured && platformTxBuilderConfigured && fundingGuardConfigured;

  return {
    mode: canBroadcast ? "live" : "mock",
    canBroadcast,
    network: networkReady ? network : undefined,
    items,
    summary: canBroadcast
      ? "Live deployment broadcast is available."
      : "Live monitoring and preflight are active; transaction broadcast remains gated until the signer boundary is configured.",
    nextAction: canBroadcast
      ? "Review the generated L1 config and request explicit wallet approval before broadcast."
      : "Connect Core Wallet, add signer service configuration, enable funding guard checks, and wire the PlatformVM transaction builder.",
    checkedAt,
  };
}
