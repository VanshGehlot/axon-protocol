export type AccessMode = "public" | "permissioned";
export type GasToken = "AVAX" | "CUSTOM";

export type L1Validator = {
  nodeId: string;
  weight: number;
  uptime?: number;
};

export type L1Config = {
  chainName: string;
  vmId: "SubnetEVM";
  validators: L1Validator[];
  gasToken: GasToken;
  customGasTokenSymbol?: string;
  targetBlockRate: number;
  minBaseFee: string;
  gasLimit: number;
  chainId: number;
  feeRecipient: string;
  permissions: AccessMode;
  tpsTarget: number;
  purpose: string;
};

export type AgentAction = "DEPLOY" | "MONITOR" | "INFO";

export type AgentChatRequest = {
  message: string;
  sessionId: string;
  walletAddress?: string;
};

export type AgentChatResponse = {
  reply: string;
  action?: AgentAction;
  config?: L1Config;
};

export type DeploymentResult = {
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  txHash: string;
  subnetId: string;
  status: "deployed" | "mocked";
  networkPreflight?: AvalancheNetworkSnapshot;
};

export type DeploymentReadinessItem = {
  id: string;
  label: string;
  status: "ready" | "pending" | "blocked";
  detail: string;
};

export type DeploymentReadiness = {
  mode: "mock" | "live";
  canBroadcast: boolean;
  summary: string;
  network?: AvalancheNetworkSnapshot;
  items: DeploymentReadinessItem[];
  nextAction: string;
  checkedAt: string;
};

export type DeploymentRecord = {
  id: string;
  config: L1Config;
  result: DeploymentResult;
  walletAddress: string;
  createdAt: string;
};

export type ValidatorMetric = {
  nodeId: string;
  uptime: number;
  compliant: boolean;
  lastSeen: string;
};

export type ChainHealth = {
  chainId: string;
  chainName: string;
  validators: ValidatorMetric[];
  tps: number;
  blockTime: number;
  txCount24h: number;
  gasPriceTrend: number[];
  icmMessageCount: number;
  complianceStatus: "green" | "yellow" | "red";
  source?: "avalanche-sdk" | "mock";
  networkName?: string;
  networkId?: string;
  pChainHeight?: string;
  cChainBlock?: string;
  updatedAt?: string;
  fallbackReason?: string;
};

export type AvalancheNetworkSnapshot = {
  source: "avalanche-sdk";
  networkName: string;
  networkId: string;
  pChainHeight: string;
  cChainBlock: string;
  baseFeeWei: string;
  validatorCount: number;
  updatedAt: string;
};
