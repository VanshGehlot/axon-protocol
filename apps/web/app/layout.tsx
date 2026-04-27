import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axon Protocol",
  description: "Deploy and manage Avalanche L1s through natural language conversation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
