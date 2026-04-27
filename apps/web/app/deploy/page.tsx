import { ChatInterface } from "@/components/ChatInterface";
import { SiteNav } from "@/components/SiteNav";

export default function DeployPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ChatInterface />
      </main>
    </>
  );
}
