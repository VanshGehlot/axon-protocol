import Link from "next/link";
import { Activity, Boxes, Code2, Mountain, Play, Terminal } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { cn } from "@/lib/utils";

const links = [
  { href: "/demo", label: "Demo", icon: Play },
  { href: "/deploy", label: "Deploy", icon: Terminal },
  { href: "/monitor", label: "Monitor", icon: Activity },
  { href: "/avalanche", label: "Avalanche", icon: Mountain },
  { href: "/sdk", label: "SDK", icon: Code2 },
];

export function SiteNav({ className }: { className?: string }) {
  return (
    <header className={cn("sticky top-0 z-30 border-b border-border bg-background/88 backdrop-blur", className)}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center border border-accent bg-accent/10 text-accent">
            <Boxes className="h-4 w-4" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-normal">Axon Protocol</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-9 items-center gap-2 border border-transparent px-3 text-sm text-muted transition hover:border-border hover:text-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden border border-border px-2.5 py-1.5 text-xs text-muted sm:inline-flex">
            Fuji mode
          </span>
          <WalletConnect compact />
        </div>
      </div>
    </header>
  );
}
