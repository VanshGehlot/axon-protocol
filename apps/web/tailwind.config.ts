import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/sdk/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#F7F7F7",
        muted: "#9CA3AF",
        border: "rgba(255,255,255,0.12)",
        panel: "#101010",
        panel2: "#151515",
        accent: "#E84142",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        heading: ["Syne", "Inter", "system-ui", "sans-serif"],
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["DM Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      boxShadow: {
        red: "0 0 0 1px rgba(232,65,66,0.26), 0 18px 60px rgba(232,65,66,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
