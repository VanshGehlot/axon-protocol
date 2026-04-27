import { createAvalancheClient } from "@avalanche-sdk/client";
import { avalancheFuji } from "@avalanche-sdk/client/chains";
import type { AvalancheNetworkSnapshot, ChainHealth, L1Validator, ValidatorMetric } from "@/lib/types";

type AvalancheValidator = {
  nodeID: string;
  uptime?: string;
  connected?: boolean;
};

type AvalancheClient = ReturnType<typeof createAvalancheClient> & {
  info: {
    getNetworkID(): Promise<{ networkID: string }>;
    getNetworkName(): Promise<{ networkName: string }>;
  };
  pChain: {
    getHeight(): Promise<{ height: string | number }>;
    getCurrentValidators(args: { subnetID?: string; nodeIDs?: string[] }): Promise<{ validators: AvalancheValidator[] }>;
  };
};

let fujiClient: AvalancheClient | null = null;

export function getFujiClient() {
  if (!fujiClient) {
    fujiClient = createAvalancheClient({
      chain: avalancheFuji,
      transport: {
        type: "http",
        url: process.env.NEXT_PUBLIC_AVALANCHE_RPC || "https://api.avax-test.network/ext/bc/C/rpc",
      },
    }) as unknown as AvalancheClient;
  }

  return fujiClient;
}

export async function getAvalancheNetworkSnapshot(): Promise<AvalancheNetworkSnapshot> {
  const client = getFujiClient();
  const [networkID, networkName, pChainHeight, cChainBlock, baseFeeWei, currentValidators] = await Promise.all([
    client.info.getNetworkID(),
    client.info.getNetworkName(),
    client.pChain.getHeight(),
    client.getBlockNumber(),
    client.baseFee(),
    client.pChain.getCurrentValidators({}),
  ]);

  return {
    source: "avalanche-sdk",
    networkName: networkName.networkName,
    networkId: networkID.networkID,
    pChainHeight: String(pChainHeight.height),
    cChainBlock: String(cChainBlock),
    baseFeeWei: String(baseFeeWei),
    validatorCount: currentValidators.validators.length,
    updatedAt: new Date().toISOString(),
  };
}

export async function getAvalancheFujiChainHealth(chainId = "43113"): Promise<ChainHealth> {
  const client = getFujiClient();
  const [networkID, networkName, pChainHeight, cChainBlock, feeHistory, currentValidators] = await Promise.all([
    client.info.getNetworkID(),
    client.info.getNetworkName(),
    client.pChain.getHeight(),
    client.getBlockNumber(),
    client.getFeeHistory({ blockCount: 8, rewardPercentiles: [50] }),
    client.pChain.getCurrentValidators({}),
  ]);

  const validators = currentValidators.validators
    .map((validator: AvalancheValidator, index: number) => toValidatorMetric(validator, index))
    .sort((left, right) => Number(right.compliant) - Number(left.compliant) || right.uptime - left.uptime)
    .slice(0, 8);
  const belowThreshold = validators.filter((validator) => !validator.compliant).length;
  const gasPriceTrend = feeHistory.baseFeePerGas.map((fee: bigint) => Number(fee));

  return {
    chainId,
    chainName: chainId === "43113" ? "Fuji Primary Network" : `Fuji chain ${chainId}`,
    validators,
    tps: 0,
    blockTime: avalancheFuji.blockTime ?? 2,
    txCount24h: Number(cChainBlock % 100000n),
    gasPriceTrend,
    icmMessageCount: 0,
    complianceStatus: belowThreshold === 0 ? "green" : belowThreshold <= 2 ? "yellow" : "red",
    source: "avalanche-sdk",
    networkName: networkName.networkName,
    networkId: networkID.networkID,
    pChainHeight: String(pChainHeight.height),
    cChainBlock: String(cChainBlock),
    updatedAt: new Date().toISOString(),
  };
}

export async function getAvalancheFujiValidator(nodeId: string): Promise<ValidatorMetric> {
  const client = getFujiClient();
  const response = await client.pChain.getCurrentValidators({ nodeIDs: [nodeId] });
  const validator = response.validators[0];
  if (!validator) {
    throw new Error(`Validator ${nodeId} was not returned by platform.getCurrentValidators`);
  }

  return toValidatorMetric(validator, 0);
}

export async function getAvalancheFujiValidatorCandidates(limit = 8): Promise<L1Validator[]> {
  const client = getFujiClient();
  const response = await client.pChain.getCurrentValidators({});

  return response.validators
    .map((validator: AvalancheValidator, index: number) => toValidatorMetric(validator, index))
    .filter((validator) => validator.compliant)
    .sort((left, right) => right.uptime - left.uptime)
    .slice(0, limit)
    .map((validator) => ({
      nodeId: validator.nodeId,
      weight: 100,
      uptime: validator.uptime,
    }));
}

function toValidatorMetric(validator: AvalancheValidator, index: number): ValidatorMetric {
  const reportedUptime = validator.uptime ? Number.parseFloat(validator.uptime) : 0;
  const uptime = Number.isFinite(reportedUptime) ? reportedUptime : 0;

  return {
    nodeId: validator.nodeID,
    uptime,
    compliant: uptime >= 90 && validator.connected !== false,
    lastSeen: new Date(Date.now() - index * 2 * 60_000).toISOString(),
  };
}
