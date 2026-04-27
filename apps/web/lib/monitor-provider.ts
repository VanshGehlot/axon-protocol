import { getMockChainHealth, getValidatorMetric } from "@/lib/axon";
import { getAvalancheFujiChainHealth, getAvalancheFujiValidator } from "@/lib/avalanche-live";
import type { ChainHealth, ValidatorMetric } from "@/lib/types";

export interface ChainMonitorProvider {
  getChainHealth(chainId: string): Promise<ChainHealth>;
  getValidator(nodeId: string): Promise<ValidatorMetric>;
}

class MockFujiMonitorProvider implements ChainMonitorProvider {
  async getChainHealth(chainId: string) {
    return getMockChainHealth(chainId);
  }

  async getValidator(nodeId: string) {
    return getValidatorMetric(nodeId);
  }
}

class AvalancheSdkFujiMonitorProvider implements ChainMonitorProvider {
  async getChainHealth(chainId: string) {
    try {
      return await getAvalancheFujiChainHealth(chainId);
    } catch (error) {
      const fallback = getMockChainHealth(chainId);
      return {
        ...fallback,
        source: "mock" as const,
        fallbackReason: error instanceof Error ? error.message : "Avalanche SDK request failed",
        updatedAt: new Date().toISOString(),
      };
    }
  }

  async getValidator(nodeId: string) {
    try {
      return await getAvalancheFujiValidator(nodeId);
    } catch {
      return getValidatorMetric(nodeId);
    }
  }
}

export function getChainMonitorProvider(): ChainMonitorProvider {
  if (process.env.AXON_FORCE_MOCK_AVALANCHE === "true") {
    return new MockFujiMonitorProvider();
  }

  return new AvalancheSdkFujiMonitorProvider();
}
