# Web improvement tracker (`apps/web`)

Companion to [`apps/web/Rules.md`](../../apps/web/Rules.md). Work **in slice order** below; one slice ≈ one PR unless notes say to pair. Update this file before ending each session.

## Tracker rules

- Follow locked slice order (dependencies first).
- After each slice: `yarn lint` and `yarn build` from `apps/web`, plus short manual smoke (wallet load, network toggle, balance refresh, send modal, history modal).
- Add or extend **targeted** tests when a module is stable (e.g. new selector/hook); full E2E can wait until network/hooks settle.
- Keep slices small; prefer incremental refactors over big-bang PRs.

## Quick snapshot

### Ordered status table


| #   | Slice                           | State       | Primary files / area                                                                                 | Notes                                                                                    |
| --- | ------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | `web-hooks-conditional-network` | Done        | `useWalletFeatures.ts`, `useSendModal.ts`, `useTransactionHistory.ts`, `useNetworkManager.ts`, `NetworkManager.ts` | `useNetworkManager` accepts `adapter: null`; `getEffectiveNetworkFromStores` for read path |
| 2   | `web-network-authority`         | Not Started | `NetworkManager.ts`, `useNetworkManager.ts`, `NetworkToggleContext.tsx`, `NetworkToggleProvider.tsx` | Single effective-network path; remove `(manager as any)`; align with slice 1 if same PR  |
| 3   | `web-select-wallet-by-id`       | Not Started | `@my-org/store` or `apps/web/app/lib/utils/` + call sites                                            | Deduplicate concat + `.find` for wallet by id                                            |
| 4   | `web-types-send-wallet`         | Not Started | `IWalletAdapter.ts`, hooks, adapters                                                                 | Replace `any` on wallet / send paths; narrow `sendTransaction` (union or per-chain DTOs) |
| 5   | `web-send-modal-props`          | Not Started | `SendModal.tsx`, `SendModalTypes.ts`, `WalletRendererContent.tsx`                                    | Remove or rename misleading `network` prop                                               |
| 6   | `web-wallet-renderer-split`     | Not Started | `WalletRenderer.tsx`, new hooks under `app/hooks/`                                                   | `useWalletBalanceFetch`, `usePerWalletModalState` (keep lean)                            |
| 7   | `web-transaction-history-slim`  | Not Started | `useTransactionHistory.ts`                                                                           | Split cache vs fetch; remove debug logs; reduce branching (complexity ≤ 5)               |
| 8   | `web-app-shell`                 | Not Started | `app/layout.tsx`                                                                                     | Product metadata; theme init (optional `next-themes`)                                    |
| 9   | `web-send-modal-dead-tabs`      | Not Started | `SendModal.tsx`                                                                                      | Remove or collapse disabled QR/image tabs until implemented                              |


**State values:** `Not Started` | `In Progress` | `Blocked` | `Done`

### Work buckets


| Bucket  | Items                                                                                |
| ------- | ------------------------------------------------------------------------------------ |
| Done    | Slice **1** `web-hooks-conditional-network`                                          |
| Running | —                                                                                    |
| Next up | Slice **2** `web-network-authority`                                                    |


---

## Slice ledger

Use this section for handoff detail. Copy the template for the active slice; mark **Done** and add PR/commit when finished.

### Slice 1: `web-hooks-conditional-network`

- **PR / commit:** (local; commit on `feat/web-micro-frontend-migration`)
- **Status:** Done
- **Goal:** No conditional hook calls; `useNetworkManager` always runs with stable arity (internal no-op / early return if no wallet).
- **Files changed:** `apps/web/app/hooks/useWalletFeatures.ts`, `apps/web/app/components/ui/wallet/modals/hooks/useSendModal.ts`, `apps/web/app/components/ui/wallet/modals/hooks/useTransactionHistory.ts`, `apps/web/app/hooks/useNetworkManager.ts`, `apps/web/app/lib/services/NetworkManager.ts`
- **Tests:** Smoke recommended (wallet + network toggle + send + history modals)
- **Recorded checks:** `yarn workspace web lint` (warnings pre-existing) / `yarn workspace web build` Pass / smoke — (run locally)

### Slice 2: `web-network-authority`

- **PR / commit:** —
- **Status:** Not Started
- **Goal:** One module owns effective cluster + toggle; no duplicate `keyFor` logic; no mutating manager via `useMemo`.
- **Files (expected):** `apps/web/app/lib/services/NetworkManager.ts`, `apps/web/app/hooks/useNetworkManager.ts`, `apps/web/app/contexts/NetworkToggleContext.tsx`, `apps/web/app/components/ui/wallet/shared/NetworkToggleProvider.tsx`
- **Tests:** Smoke + toggle across header / send / history
- **Recorded checks:** lint — / build — / smoke —

### Slice 3: `web-select-wallet-by-id`

- **PR / commit:** —
- **Status:** Not Started
- **Goal:** Single helper or selector; all call sites use it.
- **Files (expected):** store package or `apps/web/app/lib/utils/selectWallet.ts` + consumers
- **Recorded checks:** lint — / build — / smoke —

### Slice 4: `web-types-send-wallet`

- **PR / commit:** —
- **Status:** Not Started
- **Goal:** Typed `sendTransaction`; hooks return `Wallet` (or null), not `any`.
- **Files (expected):** `apps/web/app/lib/adapters/IWalletAdapter.ts`, adapters, affected hooks
- **Recorded checks:** lint — / build — / smoke —

### Slice 5: `web-send-modal-props`

- **PR / commit:** —
- **Status:** Not Started
- **Goal:** Props match reality (`chain` / `walletId` only, or `cluster` if needed).
- **Files (expected):** `SendModal.tsx`, `WalletRendererContent.tsx`, `app/types/wallet/SendModalTypes.ts`
- **Recorded checks:** lint — / build — / smoke —

### Slice 6: `web-wallet-renderer-split`

- **PR / commit:** —
- **Status:** Not Started
- **Goal:** Smaller `WalletRenderer`; behavior unchanged.
- **Recorded checks:** lint — / build — / smoke —

### Slice 7: `web-transaction-history-slim`

- **PR / commit:** —
- **Status:** Not Started
- **Goal:** Lower complexity; no production `console.log` in ETH path.
- **Recorded checks:** lint — / build — / smoke —

### Slice 8: `web-app-shell`

- **PR / commit:** —
- **Status:** Not Started
- **Goal:** Metadata + theme story documented; no functional wallet regressions.
- **Recorded checks:** lint — / build — / smoke —

### Slice 9: `web-send-modal-dead-tabs`

- **PR / commit:** —
- **Status:** Not Started
- **Goal:** Less UI noise; single “coming soon” or remove tabs.
- **Recorded checks:** lint — / build — / smoke —

