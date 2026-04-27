import type { ChainHealth, DeploymentResult, L1Config, L1Validator, ValidatorMetric } from "@/lib/types";

export const FUJI_CONFIG = {
  networkId: 5,
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  explorerUrl: "https://testnet.snowtrace.io",
  avaxFaucet: "https://faucet.avax.network",
  subnetApiUrl: "https://api.avax-test.network/ext/bc/P",
  infoApiUrl: "https://api.avax-test.network/ext/info",
} as const;

const PUBLIC_FUJI_VALIDATORS = [
  "NodeID-7Xhw2mDxuDS44j42TCB6U5579esbSt3Lg",
  "NodeID-MFrZFVCXPv5iCn6M9K6XduxGTYp891xXZ",
  "NodeID-NFBbbJ4qCmNaCzeW7sxErhvWqvEQMnYcN",
  "NodeID-GWPcbFJZFfZreETSoWjPimr846mXEKCtu",
  "NodeID-PM2LqrGsxQK4pXRpSCzJ5Y5vYxUiP8h7N",
  "NodeID-6Swns2QqKTFk9HeHLxQvZ8W8aZJYHucqG",
  "NodeID-D1LbWvUf9iaeEyUbTYYtYq4b7GaYR5tnJ",
];

export const AXON_SYSTEM_PROMPT = `You are Axon, an AI agent that helps developers deploy and manage custom Avalanche L1 blockchains.

Your capabilities:
1. Help users deploy a new Avalanche L1 (subnet) by collecting requirements through conversation
2. Generate valid Avalanche L1 configuration JSON from natural language
3. Monitor chain health and explain metrics in plain English
4. Answer technical questions about Avalanche L1 architecture

When a user wants to deploy an L1:
- Ask for: chain name, purpose (gaming/DeFi/enterprise/etc.), validator count preference, gas token preference, public or permissioned access
- Generate a complete L1 config JSON
- Show the config clearly formatted
- Ask for confirmation before deploying
- After deployment, provide: Chain ID, RPC URL, explorer link, and next steps

When a user asks about chain health:
- Summarize validator uptime vs the 90% ACP-267 threshold
- Flag any issues clearly
- Suggest actions if validators are underperforming

Always be concise, technical but accessible, and action-oriented.
Never hallucinate chain IDs, RPC URLs, or validator data - only use real data from the Avalanche API.`;

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function titleCase(input: string) {
  return input
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function generateL1Config(
  message: string,
  walletAddress = "0x0000000000000000000000000000000000000000",
  validatorCandidates?: L1Validator[],
): L1Config {
  const normalized = message.toLowerCase();
  const validatorMatch = normalized.match(/(\d+)\s*(validator|validators|nodes?)/);
  const tpsMatch = normalized.match(/(\d{2,6})\s*(tps|transactions per second)/);
  const namedMatch = message.match(/(?:called|named|name it|chain name is)\s+([A-Za-z0-9 _-]{3,32})/i);
  const purpose = normalized.includes("game") || normalized.includes("gaming")
    ? "gaming"
    : normalized.includes("defi")
      ? "DeFi"
      : normalized.includes("enterprise")
        ? "enterprise"
        : normalized.includes("social")
          ? "social"
          : "general-purpose";
  const chainName = namedMatch?.[1]?.trim()
    ? titleCase(namedMatch[1].trim())
    : `${titleCase(purpose)} Axon L1`;
  const validatorPool: L1Validator[] =
    validatorCandidates && validatorCandidates.length > 0
      ? validatorCandidates
      : PUBLIC_FUJI_VALIDATORS.map((nodeId) => ({ nodeId, weight: 100 }));
  const validatorCount = Math.min(Math.max(Number(validatorMatch?.[1] ?? 3), 1), validatorPool.length);
  const tpsTarget = Math.min(Math.max(Number(tpsMatch?.[1] ?? 500), 50), 5000);
  const gasLimit = Math.max(15_000_000, Math.ceil(tpsTarget * 42_000));
  const permissions = normalized.includes("permissioned") || normalized.includes("private") ? "permissioned" : "public";
  const gasToken = normalized.includes("custom") ? "CUSTOM" : "AVAX";
  const chainId = 100000 + (hashString(`${message}:${walletAddress}`) % 899999);

  return {
    chainName,
    vmId: "SubnetEVM",
    validators: validatorPool.slice(0, validatorCount).map((validator) => ({
      nodeId: validator.nodeId,
      weight: validator.weight,
      uptime: validator.uptime,
    })),
    gasToken,
    customGasTokenSymbol: gasToken === "CUSTOM" ? "AXON" : undefined,
    targetBlockRate: Math.max(1, Math.round(1000 / Math.max(tpsTarget / 250, 1)) / 1000),
    minBaseFee: "25 nAVAX",
    gasLimit,
    chainId,
    feeRecipient: walletAddress,
    permissions,
    tpsTarget,
    purpose,
  };
}

export function explainConfig(config: L1Config) {
  return [
    `Generated ${config.chainName} with ${config.validators.length} Fuji validators.`,
    `Gas token: ${config.gasToken}${config.customGasTokenSymbol ? ` (${config.customGasTokenSymbol})` : ""}.`,
    `Target: ${config.tpsTarget} TPS, ${config.gasLimit.toLocaleString()} gas limit, ${config.permissions} access.`,
    "Review the JSON and confirm when you want the Fuji deploy rehearsal to run with live SDK preflight.",
  ].join(" ");
}

export function createMockDeployment(config: L1Config, walletAddress: string): DeploymentResult {
  const seed = hashString(`${config.chainId}:${config.chainName}:${walletAddress}`);
  const chainId = String(config.chainId);
  return {
    chainId,
    subnetId: `subnet-${seed.toString(16).padStart(8, "0")}`,
    rpcUrl: `https://rpc.axon.local/fuji/${chainId}`,
    explorerUrl: `${FUJI_CONFIG.explorerUrl}/address/${walletAddress || "0x0000000000000000000000000000000000000000"}`,
    txHash: `0x${seed.toString(16).padStart(64, "0")}`,
    status: "mocked",
  };
}

export function getValidatorMetric(nodeId: string, index = 0): ValidatorMetric {
  const uptime = Math.max(82, Math.min(99.9, 98.4 - index * 2.7 + (hashString(nodeId) % 16) / 10));
  return {
    nodeId,
    uptime,
    compliant: uptime >= 90,
    lastSeen: new Date(Date.now() - index * 11 * 60_000).toISOString(),
  };
}

export function getMockChainHealth(chainId = "43113"): ChainHealth {
  const validators = PUBLIC_FUJI_VALIDATORS.slice(0, 5).map(getValidatorMetric);
  const belowThreshold = validators.filter((validator) => !validator.compliant).length;
  return {
    chainId,
    chainName: chainId === "43113" ? "Fuji Reference L1" : `Axon L1 ${chainId}`,
    validators,
    tps: 742,
    blockTime: 1.2,
    txCount24h: 128940,
    gasPriceTrend: [25, 26, 25, 28, 27, 31, 29, 30],
    icmMessageCount: 1842,
    complianceStatus: belowThreshold === 0 ? "green" : belowThreshold === 1 ? "yellow" : "red",
  };
}
