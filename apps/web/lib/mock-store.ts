import type { DeploymentRecord } from "@/lib/types";

const globalStore = globalThis as typeof globalThis & {
  __axonDeployments?: DeploymentRecord[];
};

export function saveMockDeployment(record: DeploymentRecord) {
  const records = globalStore.__axonDeployments ?? [];
  globalStore.__axonDeployments = [record, ...records].slice(0, 12);
}

export function listMockDeployments() {
  return globalStore.__axonDeployments ?? [];
}
