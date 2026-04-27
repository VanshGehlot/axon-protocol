# Axon Protocol

> Deploy and manage Avalanche L1s through natural language conversation.

Axon is an AI agent infrastructure layer built natively on Avalanche. Describe your chain in plain English; Axon turns that intent into a deployable Fuji L1 configuration, monitors validator health, and exposes an embeddable support agent for dApps.

## Features

- Natural language Avalanche L1 deployment
- Autonomous validator health monitoring with ACP-267 status
- Embeddable SDK for Avalanche dApps
- Fuji-ready API surface with an explicit broadcast readiness gate
- Live Fuji network preflight through `@avalanche-sdk/client`
- Live P-Chain validator reads through `platform.getCurrentValidators`
- Config generation can source validator candidates from the live Fuji P-Chain set
- Injected wallet connect plus signed Axon auth message for Core Wallet-compatible wallets
- Multilingual-ready agent architecture
- 60-second guided demo flow for reviewers
- Local deploy rehearsal history for repeatable demos

## Quick Start

```bash
git clone https://github.com/VanshGehlot/axon-protocol
cd axon-protocol
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Demo Path

For a fast review, open:

```text
http://localhost:3000/demo
```

Click `Run full demo` to execute the complete product story:

1. Generate a Fuji-ready Avalanche L1 config from natural language.
2. Select validator candidates from live Fuji data when the SDK is reachable.
3. Create a deterministic Fuji deploy rehearsal receipt after live SDK preflight.
4. Load validator health through the monitor provider boundary.
5. Save the rehearsal into local deployment history.

## Network

Currently targeted at Avalanche Fuji Testnet.
Mainnet launch: Q3 2026.

## Tech Stack

Next.js 14, Tailwind, OpenAI/Anthropic-ready agent endpoint, AvalancheJS-ready API routes, Supabase-ready persistence, Vercel

## Monorepo

```text
apps/web       Next.js product app and API routes
packages/sdk   Embeddable AxonWidget package
docs           Product and integration notes
contracts      Reserved for future Solidity contracts
```

## API

- `POST /api/agent/chat`
- `POST /api/deploy/l1`
- `GET /api/deploy/readiness`
- `GET /api/monitor/chain/:chainId`
- `GET /api/monitor/validator/:nodeId`
- `POST /api/sdk/widget-config`

The deployment endpoint currently returns a deterministic Fuji rehearsal receipt plus live network preflight. The readiness endpoint exposes exactly what must be configured before a live PlatformVM broadcast is allowed.

## Avalanche Integration Boundary

The app intentionally separates:

- Config generation: `apps/web/lib/axon.ts`
- Live validator candidate loading: `apps/web/lib/avalanche-live.ts`
- Wallet connect/signing surface: `apps/web/components/WalletConnect.tsx`
- Broadcast readiness gate: `GET /api/deploy/readiness`
- Deployment receipt generation: `POST /api/deploy/l1`
- Mock deployment history: `GET /api/deploy/history`
- Live Fuji SDK client: `apps/web/lib/avalanche-live.ts`
- Monitor provider interface with SDK fallback: `apps/web/lib/monitor-provider.ts`

That keeps the demo usable today while making the production gap explicit: Core Wallet authentication, funding guard checks, PlatformVM transaction creation, signer service configuration, and Supabase persistence. Set `AXON_FORCE_MOCK_AVALANCHE=true` only when you need an offline demo.
