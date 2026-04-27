import { DemoConsole } from "@/components/DemoConsole";
import { SiteNav } from "@/components/SiteNav";

export default function DemoPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DemoConsole />
      </main>
    </>
  );
}
