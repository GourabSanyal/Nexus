# Web Frontend Rules

Source of truth for architecture, complexity, and change discipline in `apps/web`.

## High-level design (HLD)

- **Layers**: UI (presentational) → hooks (orchestration) → **adapters** (chain behavior) → **utils/API** (I/O). UI must not embed chain-specific RPC or signing logic; use `IWalletAdapter` + `WalletAdapterFactory`.
- **Chain presentation**: Explorer links, receive URIs, currency symbols, and chain labels go through **`IWalletAdapter`** (via `useWalletAdapter` / `useWalletFeatures`). Shared rules live in `lib/adapters/chainPresentation.ts` (adapter internals only — do not import from UI).
- **Single network authority**: Effective cluster reads use `**getEffectiveNetworkFromStores`**; writes and toggles use `**NetworkManager**` (shared by `useNetworkManager` and `NetworkToggleContext`). Do not duplicate override resolution in UI.
- **State**: Recoil for global wallet/network/history; React context only for subtree UI concerns. Avoid parallel sources of truth for the same field.
- **Next.js**: Keep `"use client"` boundaries tight; default to server components only when you add server-only data—today the app is client-heavy by design.

## Low-level design (LLD) and complexity

- Target **cyclomatic complexity ≤ 5** per function; split early when `if`/branch nesting grows.
- Target **≤ ~150 LOC** per non-generated file where practical; extract hooks and pure helpers.
- **Hooks**: Never call hooks conditionally (including `adapter ? useNetworkManager(...) : null`). Always call the same hooks in the same order; gate behavior inside the hook or with stable no-op adapters.
- Prefer **typed contracts** over `any` / loose `Promise<any>` on public hooks and adapters (send path is typed; keep new code strict).
- Remove **debug `console.log`** from production paths (e.g. transaction history) or guard behind a dev flag.

## Patterns checklist


| Pattern  | Where it applies                   | Rule                                                                                   |
| -------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| Adapter  | Balance, history, send, validation, presentation | All chain differences live in adapter implementations; UI calls adapter, not `chainPresentation` directly |
| Factory  | `WalletAdapterFactory`             | Only supported entry for creating adapters                                             |
| Facade   | `useWalletFeatures`                | Thin facade over adapter + network; must stay hook-safe                                |
| Strategy | Network order / next cluster       | Encapsulated in adapter (`getNextNetwork`), not in UI                                  |
| DRY      | Network resolution                 | `getEffectiveNetworkFromStores` + `NetworkManager` only; no ad‑hoc `keyFor` in context |


## Env, API, and security

- RPC and send flows go through shared clients (e.g. `rustApiClient`); do not fork per-screen.
- **Never** log or persist private keys; keep signing boundaries in minimal modules (e.g. `sendTransaction`).

## Quality gates (local)

- `yarn lint` (or `npm run lint` from `apps/web`)
- `yarn build`
- Prefer adding tests when touching send/balance/history logic (establish minimal harness if missing).

## Change management

- Prefer incremental refactors; keep slices small and reviewable.
- After behavior changes, update any cross-package contracts (`@api-types`, `@my-org/store`, `@my-org/zod`) in the same change set when needed.

---

## Improvement slices (audit backlog)

Improvement slices **1–16** are complete. Post-backlog adapter presentation alignment is tracked as slice **17** in [`docs/migration/web-improvement-tracker.md`](../docs/migration/web-improvement-tracker.md).
