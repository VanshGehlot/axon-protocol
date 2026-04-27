import { ChainDashboard } from "@/components/ChainDashboard";
import { SiteNav } from "@/components/SiteNav";
import { getChainMonitorProvider } from "@/lib/monitor-provider";

export const dynamic = "force-dynamic";

export default async function MonitorPage() {
  const provider = getChainMonitorProvider();
  const initialHealth = await provider.getChainHealth("43113");

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ChainDashboard initialHealth={initialHealth} />
      </main>
    </>
  );
}
