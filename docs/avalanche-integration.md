# Avalanche Integration Notes

The app now uses `@avalanche-sdk/client` for live Fuji network preflight and monitoring reads. The deployment transaction itself is still gated because live L1 creation requires a signer, funded wallet, and explicit user approval.

Live code paths:

- `apps/web/lib/avalanche-live.ts` creates the Fuji client with `createAvalancheClient`.
- `GET /api/avalanche/network` returns live Info, P-Chain, and C-Chain status.
- `GET /api/monitor/chain/:chainId` reads live P-Chain validators through the monitor provider unless `AXON_FORCE_MOCK_AVALANCHE=true`.
- `GET /api/deploy/readiness` reports broadcast readiness for Fuji preflight, Core Wallet, signer service, funding guard, and PlatformVM transaction builder.
- `POST /api/deploy/l1` attaches a live Fuji network preflight to the deploy rehearsal receipt when Fuji is reachable.

To enable real deployment:

1. Add a backend signer service or wallet delegation flow.
2. Configure `AXON_SIGNER_SERVICE_URL`, `AXON_PLATFORM_TX_BUILDER_URL`, and `AXON_ENABLE_FUNDING_GUARD=true`.
3. Replace `createMockDeployment` in `apps/web/lib/axon.ts` with calls to Avalanche PlatformVM APIs.
4. Replace the in-memory mock history in `apps/web/lib/mock-store.ts` with Supabase `chains`.
5. Swap `MockFujiMonitorProvider` in `apps/web/lib/monitor-provider.ts` for an Avalanche API provider.
6. Poll validator data through `platform.getCurrentValidators` and write snapshots into `validator_snapshots`.
7. Keep the API response shape stable so the UI and SDK do not change.

Fuji constants live in `FUJI_CONFIG`.
