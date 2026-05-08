# Web Frontend Rules

Source of truth for architecture, complexity, and change discipline in `apps/web`.

## High-level design (HLD)

- **Layers**: UI (presentational) → hooks (orchestration) → **adapters** (chain behavior) → **utils/API** (I/O). UI must not embed chain-specific RPC or signing logic; use `IWalletAdapter` + `WalletAdapterFactory`.
- **Single network authority**: Prefer one path for effective cluster (Recoil + `NetworkManager` **or** `NetworkToggleContext`, not both with duplicated `keyFor` / toggle logic).
- **State**: Recoil for global wallet/network/history; React context only for subtree UI concerns. Avoid parallel sources of truth for the same field.
- **Next.js**: Keep `"use client"` boundaries tight; default to server components only when you add server-only data—today the app is client-heavy by design.

## Low-level design (LLD) and complexity

- Target **cyclomatic complexity ≤ 5** per function; split early when `if`/branch nesting grows.
- Target **≤ ~150 LOC** per non-generated file where practical; extract hooks and pure helpers.
- **Hooks**: Never call hooks conditionally (including `adapter ? useNetworkManager(...) : null`). Always call the same hooks in the same order; gate behavior inside the hook or with stable no-op adapters.
- Prefer **typed contracts** over `any` / loose `Promise<any>` on adapter `sendTransaction` and hook return `wallet: any`.
- Remove **debug `console.log`** from production paths (e.g. transaction history) or guard behind a dev flag.

## Patterns checklist

| Pattern | Where it applies | Rule |
|--------|------------------|------|
| Adapter | Balance, history, send, validation | All chain differences live in adapter implementations |
| Factory | `WalletAdapterFactory` | Only supported entry for creating adapters |
| Facade | `useWalletFeatures` | Thin facade over adapter + network; must stay hook-safe |
| Strategy | Network order / next cluster | Encapsulated in adapter (`getNextNetwork`), not in UI |
| DRY | Network resolution | One `keyFor` + effective-network helper, imported—not copied |

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

Short, actionable items—implement in small PRs; avoid scope creep.

| Slice / feature | Issue | Lean improvement |
|-----------------|-------|------------------|
| **Network state** | Duplicated effective-network + toggle logic (`NetworkManager`, `NetworkToggleContext`, `useNetworkManager` mutation via `(manager as any)`) | One module: Recoil selectors or a single hook; no `(manager as any)` |
| **React hooks** | Conditional `useNetworkManager` in `useWalletFeatures`, `useSendModal`, `useTransactionHistory` | Always invoke hook; pass nullable id or use stub adapter internally |
| **Send modal API** | `SendModal` `network` prop mirrors `chain` name; misleading / unused | Drop redundant prop or rename to `cluster` if ever needed |
| **WalletRenderer** | Balance fetch + modal open state + animation in one component | Extract `useWalletBalanceFetch` + `usePerWalletModalState` (small hooks) |
| **Transaction history** | Large hook, refs syncing, ETH-only logs, complex `fetchTransactions` callback | Split cache vs fetch; strip logs; cap branches (complexity) |
| **useNetworkManager** | `useMemo` used for side effect (mutating manager) | `useEffect` for syncing refs, or immutable manager instance from state |
| **Types** | `any` on wallet/send paths | Narrow with shared `Wallet` + send DTO types |
| **IWalletAdapter** | `sendTransaction(params: any)` | Typed params/result per chain or shared discriminated union |
| **App shell** | Default Next metadata; inline dark script in `layout` | Product metadata; optional `next-themes` or single theme init |
| **Dead UI** | Disabled “Scan QR / Import Image” tabs | Remove until implemented, or single “Coming soon” note |
| **Cross-cutting** | Duplicate wallet lookup (concat solana + ethereum arrays) | `selectWalletById` in store or one tiny util |

When a row is done, remove it or move detail to your tracker doc—keep this table lean.
