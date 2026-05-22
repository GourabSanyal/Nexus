# Web improvement tracker (`apps/web`)

Companion to [`apps/web/Rules.md`](../../apps/web/Rules.md). Work **in slice order** below; one slice ≈ one PR unless notes say to pair. Update this file before ending each session.

**Audit snapshot:** 2026-05-04 — full pass over `apps/web/app/**` (+ cross-package touchpoints used by web).

**Slices 1–9 verification:** 2026-05-18 — code reviewed; `useWalletBalanceFetch` aligned to `getEffectiveNetworkFromStores`; `yarn workspace web lint` (warnings only, pre-existing) + `yarn workspace web build` **Pass**.

**Slices 12–16 verification:** 2026-05-19 — `yarn workspace web test` (13 tests) **Pass**; `yarn workspace web lint` (warnings only, pre-existing) + `yarn workspace web build` **Pass**.

**Slice 17 verification:** 2026-05-19 — adapter-first presentation; see ledger below.

## Tracker rules

- Follow locked slice order (dependencies first).
- After each slice: `yarn lint` and `yarn build` from `apps/web`, plus short manual smoke (wallet load, network toggle, balance refresh, send modal, history modal).
- Add or extend **targeted** tests when a module is stable (e.g. new selector/hook); full E2E can wait until network/hooks settle.
- Keep slices small; prefer incremental refactors over big-bang PRs.

### Compliance legend

| Symbol | Meaning |
| ------ | ------- |
| ✅ | Aligns with `Rules.md` for this slice’s concerns |
| ⚠️ | Mostly aligned; known gap(s) listed |
| ❌ | Clear violation or missing pattern |
| — | Out of scope (types-only, shadcn primitives, static assets) |

---

## Quick snapshot

### Ordered status table (slices 1–9 — completed)

| # | Slice | State | Primary files / area | Notes |
| --- | --- | --- | --- | --- |
| 1 | `web-hooks-conditional-network` | Done | `useWalletFeatures.ts`, `useSendModal.ts`, `useTransactionHistory.ts`, `useNetworkManager.ts`, `NetworkManager.ts` | `useNetworkManager` accepts `adapter: null`; `getEffectiveNetworkFromStores` for read path |
| 2 | `web-network-authority` | Done | `NetworkManager.ts`, `useNetworkManager.ts`, `NetworkToggleContext.tsx` | Stateless manager; context shares `NetworkManager` + `getEffectiveNetworkFromStores` |
| 3 | `web-select-wallet-by-id` | Done | `packages/store/.../selectWalletById.ts`, `useSendModal.ts`, `useTransactionHistory.ts` | `selectWalletById` from `@my-org/store` |
| 4 | `web-types-send-wallet` | Done | `sendTransaction.ts`, adapters, `useWalletFeatures.ts`, `useSendModal.ts` | Typed send + `TransactionResponse` |
| 5 | `web-send-modal-props` | Done | `SendModal.tsx`, `SendModalTypes.ts`, `WalletRendererContent.tsx` | Removed redundant `network` prop |
| 6 | `web-wallet-renderer-split` | Done | `WalletRenderer.tsx`, `useWalletBalanceFetch.ts`, `usePerWalletModalState.ts` | Balance + modal state in hooks |
| 7 | `web-transaction-history-slim` | Done | `useTransactionHistory.ts`, `transactionHistoryCache.ts`, `HistoryModal.tsx`, `transactionHistoryFetch.ts` | Cache + shared fetch; SWR skeleton; list motion |
| 8 | `web-app-shell` | Done | `layout.tsx`, `themeInit.ts`, `ThemeContext.tsx`, `WalletContent.tsx` | Nexus metadata; single theme init on `<html>` |
| 9 | `web-send-modal-dead-tabs` | Done | `SendModal.tsx` | Removed disabled Scan QR / Import Image tabs |

### Ordered status table (slices 10+ — backlog)

| # | Slice | State | Rules focus | Primary files | Compliance today |
| --- | --- | --- | --- | --- | --- |
| 10 | `web-balance-network-read-path` | Done | HLD: single network authority | `useWalletBalanceFetch.ts` | ✅ Web balance path uses `getEffectiveNetworkFromStores`; store `useNetwork` still duplicates (slice **11**) |
| 11 | `web-store-package-boundary` | Done | HLD: layers + env/API | `packages/store/src/utils/getEffectiveNetworkFromStores.ts`, `packages/store/tsconfig.json` | ✅ Store no longer imports `apps/web`; `useNetwork` removed; shared read helper exported |
| 12 | `web-complexity-history-hook` | Done | LLD: ≤150 LOC, complexity ≤5 | `useTransactionHistory.ts`, `useTransactionHistoryFetch.ts`, `useTransactionHistoryDisplay.ts`, `transactionHistoryResolve.ts` | ✅ Split fetch vs display; facade ~73 LOC |
| 13 | `web-complexity-send-path` | Done | LLD: ≤150 LOC | `send/send*.ts`, `sendTransaction.ts`, `SendModal.tsx`, `SendModalForm.tsx` | ✅ Chain send split; `catch (error: unknown)` + `getSendErrorMessage` |
| 14 | `web-import-debug-and-types` | Done | LLD: no debug logs; typed contracts | `useImportWalletForm.ts`, `SeedPhraseForm.tsx`, `WalletMainSection.tsx`, `SeedPhrase*Props.ts` | ✅ Removed `console.log`; `FieldErrors` on seed-phrase props |
| 15 | `web-ui-chain-presentation` | Done | HLD: adapter owns chain behavior | `chainPresentation.ts`, modals | ✅ Centralized presentation (refined in slice **17** via adapter facade) |
| 16 | `web-test-harness` | Done | Quality gates | `vitest.config.ts`, `app/**/*.test.ts`, `yarn workspace web test` | ✅ Vitest + cache, network util, `parseBalanceString`, `chainPresentation` |
| 17 | `web-adapter-presentation-facade` | Done | HLD: adapter owns chain behavior | `IWalletAdapter.ts`, `chainPresentation.ts` (under `lib/adapters/`), `useWalletAdapter.ts`, modals | ✅ UI/hooks use adapter only; util is adapter-internal |

**State values:** `Not Started` | `In Progress` | `Blocked` | `Done`

### Work buckets

| Bucket | Items |
| ------ | ----- |
| Done | Slices **1**–**17** (audit backlog + adapter presentation alignment) |
| Next up | — |
| Backlog | — |
| Running | — |

---

## Rules compliance by layer (`apps/web`)

Summary against [`apps/web/Rules.md`](../../apps/web/Rules.md). “Following” = no known gap for that rule category.

| Layer | Path pattern | Following? | Notes |
| ----- | ------------ | ---------- | ----- |
| Entry / shell | `app/layout.tsx`, `app/page.tsx` | ✅ | Theme init + metadata; tight server boundary |
| UI — wallet shell | `WalletContent.tsx`, `SingleWallet.tsx`, `SolanaWallet.tsx`, `EthereumWallet.tsx` | ✅ | Presentation + Recoil; no direct RPC |
| UI — wallet renderer | `WalletRenderer.tsx`, `WalletRendererContent.tsx` | ✅ | Orchestration delegated to hooks |
| UI — modals | `SendModal.tsx`, `HistoryModal.tsx`, `ReceiveModal.tsx` | ✅ | Send form extracted; chain copy via `chainPresentation` |
| UI — transaction row | `TransactionItem.tsx` | ✅ | Explorer URL via `getExplorerTransactionUrl` |
| UI — import / seed | `sections/import/**`, `SeedPhraseContainer.tsx` | ✅ | No debug logs; typed `SeedPhrase*Props` |
| UI — password / settings | `sections/password/**`, `WalletMainSection.tsx` | ✅ | Password submit without `console.log` |
| Hooks — wallet | `useWalletFeatures.ts`, `usePerWalletModalState.ts` | ✅ | Adapter + `useNetworkManager`; hook-safe |
| Hooks — balance | `useWalletBalanceFetch.ts` | ✅ | `getEffectiveNetworkFromStores` + shared `fetchWalletTransactionHistory` |
| Hooks — history | `useTransactionHistory*.ts`, `transactionHistoryResolve.ts` | ✅ | Fetch vs display split (slice **12**) |
| Hooks — send | `useSendModal.ts` | ✅ | `selectWalletById` + `useNetworkManager` |
| Hooks — network | `useNetworkManager.ts` | ✅ | Uses `getEffectiveNetworkFromStores` |
| Context | `NetworkToggleContext.tsx`, `ThemeContext.tsx` | ✅ | Network mutations via `NetworkManager`; theme via `themeInit` |
| Adapters | `lib/adapters/**` | ✅ | Factory entry; balance/history/send via utils + `rustApiClient` |
| Services | `lib/services/NetworkManager.ts`, `transactionHistoryFetch.ts` | ✅ | Shared orchestration; no UI imports |
| Utils / API | `getSolBalance.ts`, `getEthBalance.ts`, `getBalance.ts`, `fetchTransactions.ts`, `send/**` | ✅ | Send split per chain; `chainPresentation.ts` for UI URLs |
| Types | `app/types/**` | ✅ | Seed-phrase props use `FieldErrors` / `SeedPhraseFieldError` |
| Cross-package | `packages/store` `getEffectiveNetworkFromStores` | ✅ | Pure util in store; web `NetworkManager` imports it (slice **11**) |

---

## File audit — critical path (balance / history / send / network)

Files on the hot path for Solana + Ethereum balance and related flows.

| File | Slice(s) | Compliant | Rule gaps |
| ---- | -------- | --------- | --------- |
| `app/hooks/useWalletBalanceFetch.ts` | 2, 6, 7, 10 | ✅ | `getEffectiveNetworkFromStores`; shared history fetch |
| `app/hooks/useWalletFeatures.ts` | 1, 4 | ✅ | Adapter facade; `useNetworkManager` always invoked |
| `app/hooks/useNetworkManager.ts` | 1, 2 | ✅ | Single read helper from `NetworkManager` module |
| `app/lib/services/NetworkManager.ts` | 2 | ✅ | `keyFor` + `getEffectiveNetworkFromStores` centralized here |
| `app/contexts/NetworkToggleContext.tsx` | 2 | ✅ | Shares `NetworkManager` |
| `app/components/ui/wallet/shared/NetworkToggleProvider.tsx` | 2 | ✅ | Thin wrapper over context |
| `app/lib/adapters/WalletAdapterFactory.ts` | — | ✅ | Only factory entry |
| `app/lib/adapters/SolanaWalletAdapter.ts` | 4 | ✅ | Balance/history delegate to utils |
| `app/lib/adapters/EthereumWalletAdapter.ts` | 4 | ✅ | Same |
| `app/lib/utils/getSolBalance.ts` | — | ✅ | `rustApiClient` |
| `app/lib/utils/getEthBalance.ts` | — | ✅ | `rustApiClient` |
| `app/lib/utils/getBalance.ts` | — | ✅ | Chain router at utils layer (OK) |
| `app/lib/services/transactionHistoryFetch.ts` | 7 | ✅ | Shared fetch + in-flight dedupe |
| `app/components/ui/wallet/modals/utils/transactionHistoryCache.ts` | 7 | ✅ | Pure cache helpers |
| `app/components/ui/wallet/modals/hooks/useTransactionHistory*.ts` | 1, 3, 7, **12** | ✅ | Fetch/display/resolve split |
| `app/components/ui/wallet/modals/HistoryModal.tsx` | 7, **15** | ✅ | `chain` + `currencySymbol` from hook |
| `app/components/ui/wallet/modals/components/TransactionItem.tsx` | 7, **15** | ✅ | `getExplorerTransactionUrl` |
| `app/lib/utils/send/**`, `sendTransaction.ts` | 4, **13** | ✅ | Per-chain modules; thin router |
| `app/components/ui/wallet/modals/SendModal.tsx` | 5, 9, **13** | ✅ | `SendModalForm`; typed errors |
| `app/lib/adapters/chainPresentation.ts` | **15**, **17** | ✅ | Adapter-internal; UI uses `IWalletAdapter` |
| `app/components/ui/wallet/modals/hooks/useSendModal.ts` | 1, 3, 4 | ✅ | |
| `packages/store/src/utils/getEffectiveNetworkFromStores.ts` | **11** | ✅ | Single read helper; no web imports |

---

## File audit — remainder of `apps/web/app`

Grouped by area. Types-only files omitted unless they have gaps.

| Area | File | Compliant | Notes |
| ---- | ---- | --------- | ----- |
| **Theme** | `lib/theme/themeInit.ts`, `lib/contexts/ThemeContext.tsx`, `layout.tsx` | ✅ | Slice 8 |
| **Theme** | `WalletContent.tsx` | ✅ | Removed body `dark` class |
| **Wallet list** | `WalletRenderer.tsx`, `usePerWalletModalState.ts` | ✅ | Slice 6 |
| **Wallet list** | `WalletRendererContent.tsx` | ✅ | Reads balance from store; features hook |
| **Header / actions** | `sections/header/*`, `actions/*` | ✅ | No RPC; network via toggle provider |
| **Receive** | `ReceiveModal.tsx` | ✅ | `buildReceivePaymentUri` |
| **QR** | `components/ui/qrcode/QRCode.tsx` | ✅ | |
| **Import** | `useImportWalletForm.ts` | ✅ | No debug logs |
| **Import** | `SeedPhraseForm.tsx` | ✅ | No debug logs |
| **Import** | `SeedPhraseGrid.tsx`, `SeedPhraseErrors.tsx`, `ImportWallet.tsx` | ✅ | Typed error props |
| **Password** | `PasswordInput.tsx`, `WarningModal.tsx`, `LogoutConfirmationModal.tsx` | ✅ | Zod resolver |
| **Password** | `WalletMainSection.tsx` | ✅ | No `console.log` on submit |
| **Generation** | `walletGeneration.ts`, `generateSolanaWallet.ts`, `generateEthWallet.ts` | ✅ | Keys only in generation/send modules |
| **Utils** | `getSolTransactions.ts`, `getEthTransactions.ts`, `fetchTransactions.ts` | ✅ | `rustApiClient`; used by adapters |
| **Utils** | `transactionFormatters.ts`, `parseBalanceString.ts`, `convert.ts`, `clipboard.ts`, `internet.ts` | ✅ | |
| **UI primitives** | `components/ui/{button,dialog,form,...}/**` | — | shadcn-style; no domain rules |
| **Tests** | `app/**/*.test.ts`, `vitest.config.ts` | ✅ | `yarn workspace web test` |

---

## Slice ledger (1–9)

Use this section for handoff detail. Slices **1–9** are **Done**.

### Slice 1: `web-hooks-conditional-network`

- **Status:** Done
- **Compliance:** ✅ `useWalletFeatures.ts`, `useSendModal.ts`, `useTransactionHistory.ts`, `useNetworkManager.ts`

### Slice 2: `web-network-authority`

- **Status:** Done
- **Compliance:** ✅ `NetworkManager.ts`, `useNetworkManager.ts`, `NetworkToggleContext.tsx`

### Slice 3: `web-select-wallet-by-id`

- **Status:** Done
- **Compliance:** ✅ `useSendModal.ts`, `useTransactionHistory.ts`

### Slice 4: `web-types-send-wallet`

- **Status:** Done
- **Compliance:** ✅ adapters + `useWalletFeatures.ts`; ⚠️ `sendTransaction.ts` size (deferred to slice **13**)

### Slice 5: `web-send-modal-props`

- **Status:** Done
- **Compliance:** ✅ prop surface; ⚠️ `SendModal.tsx` size/types (slice **13**)

### Slice 6: `web-wallet-renderer-split`

- **Status:** Done
- **Compliance:** ✅ renderer hooks + balance hook network read (slice **10** closed for web)

### Slice 7: `web-transaction-history-slim`

- **Status:** Done
- **Compliance:** ✅ cache + shared fetch; ⚠️ hook LOC + UI factory (slices **12**, **15**)

### Slice 8: `web-app-shell`

- **Status:** Done
- **Compliance:** ✅ `layout.tsx`, `themeInit.ts`, `ThemeContext.tsx`, `WalletContent.tsx`

### Slice 9: `web-send-modal-dead-tabs`

- **Status:** Done
- **Compliance:** ✅ `SendModal.tsx` tab removal

---

## Slice ledger (10+ — template for next work)

Copy and fill when starting a slice.

### Slice 10: `web-balance-network-read-path`

- **Status:** Done (web scope)
- **Goal:** `useWalletBalanceFetch` resolves cluster only via `getEffectiveNetworkFromStores` (same Recoil maps as `useNetworkManager`), not `useNetwork()` from store.
- **Files changed:** `apps/web/app/hooks/useWalletBalanceFetch.ts`
- **Recorded checks:** `yarn workspace web build` Pass (2026-05-18)
- **Note:** `packages/store/src/hooks/useNetwork.ts` still has duplicate `keyFor` — slice **11**

### Slice 11: `web-store-package-boundary`

- **Status:** Done
- **Goal:** Remove `packages/store` → `apps/web` imports; relocate or delete unused `useNetwork` API surface.
- **Files changed:**
  - Added `packages/store/src/utils/getEffectiveNetworkFromStores.ts` (`getEffectiveNetworkFromStores`, `networkKeyFor`)
  - Deleted `packages/store/src/hooks/useNetwork.ts` (removed web imports + dead `fetchBalanceFromAPI`, `fetchAll*Transactions`, placeholder `sendEth`/`sendSol`)
  - `packages/store/tsconfig.json` — removed `@/*` → `apps/web` path alias
  - `packages/store/src/index.ts` — export util instead of `useNetwork`
  - `apps/web/app/lib/services/NetworkManager.ts` — imports from `@my-org/store`; re-exports read helper
  - `apps/web/app/hooks/useWalletBalanceFetch.ts` — imports read helper from `@my-org/store`
- **Recorded checks:** `npx tsc --noEmit` in `packages/store` Pass / `yarn workspace web build` Pass

### Slice 12: `web-complexity-history-hook`

- **Status:** Done
- **Goal:** Split `useTransactionHistory.ts` into fetch vs display hooks; keep complexity ≤5 per function.
- **Files changed:**
  - `transactionHistoryResolve.ts` — `resolveDisplayTransactions`, `showTransactionFetchError`
  - `useTransactionHistoryFetch.ts` — open/join fetch, refresh, `fetchVersion`
  - `useTransactionHistoryDisplay.ts` — Recoil + module cache display
  - `useTransactionHistory.ts` — thin facade (~73 LOC)
- **Recorded checks:** `yarn workspace web build` Pass (2026-05-19)

### Slice 13: `web-complexity-send-path`

- **Status:** Done
- **Goal:** Split `sendTransaction.ts` (SOL vs ETH); trim `SendModal.tsx`; `catch (error: unknown)`.
- **Files changed:**
  - `app/lib/utils/send/sendTransactionTypes.ts`, `sendTransactionErrors.ts`, `sendAmountUtils.ts`
  - `sendEthereumTransaction.ts`, `sendSolanaTransaction.ts`
  - `sendTransaction.ts` — thin router (~44 LOC)
  - `SendModalForm.tsx`, `getSendErrorMessage.ts`, `SendModal.tsx`
- **Recorded checks:** `yarn workspace web build` Pass (2026-05-19)

### Slice 14: `web-import-debug-and-types`

- **Status:** Done
- **Goal:** Remove production `console.log`; type seed-phrase errors.
- **Files changed:** `useImportWalletForm.ts`, `SeedPhraseForm.tsx`, `WalletMainSection.tsx`, `SeedPhraseErrorsProps.ts`, `SeedPhraseGridProps.ts`
- **Recorded checks:** `yarn workspace web lint` Pass (warnings only, pre-existing)

### Slice 15: `web-ui-chain-presentation`

- **Status:** Done
- **Goal:** Centralize explorer links, receive URIs, currency symbols for UI.
- **Files changed:** `chainPresentation.ts`, `TransactionItem.tsx`, `ReceiveModal.tsx`, `SendModal.tsx`, `HistoryModal.tsx` (hook exports `chain`, `currencySymbol`)
- **Recorded checks:** `yarn workspace web build` Pass (2026-05-19)

### Slice 16: `web-test-harness`

- **Status:** Done
- **Goal:** Minimal Vitest for cache, network util, `parseBalanceString`, `chainPresentation`.
- **Files changed:** `vitest.config.ts`, `package.json` (`test` scripts), `transactionHistoryCache.test.ts`, `getEffectiveNetworkFromStores.test.ts`, `parseBalanceString.test.ts`, `chainPresentation.test.ts`
- **Recorded checks:** `yarn workspace web test` — 13 tests Pass (2026-05-19)

### Slice 17: `web-adapter-presentation-facade`

- **Status:** Done
- **Goal:** Route chain-specific presentation (explorer, receive URI, labels, currency) through `IWalletAdapter`; keep `lib/adapters/chainPresentation.ts` as shared internals; no UI imports of presentation util.
- **Files changed:**
  - `lib/adapters/chainPresentation.ts` (moved from `lib/utils/`)
  - `lib/adapters/useWalletAdapter.ts` — `WalletAdapterFactory.create` hook for modals
  - `IWalletAdapter.ts` — `getExplorerTransactionUrl`, `buildReceivePaymentUri`, `getChainLabel`
  - `SolanaWalletAdapter.ts`, `EthereumWalletAdapter.ts` — delegate to util
  - `ReceiveModal.tsx` — `walletType` + `useWalletAdapter`
  - `SendModal.tsx` / `useSendModal.ts` — `adapter.getCurrencySymbol()`
  - `TransactionItem.tsx`, `HistoryModal.tsx` — pass `adapter`
  - `useWalletFeatures.ts` — `adapter.chain` (no `wallet.type` → enum branch)
  - `apps/web/Rules.md` — presentation rule documented
  - Tests: `lib/adapters/chainPresentation.test.ts` (util + adapter delegation)
- **Recorded checks:** `yarn workspace web test` (12 tests) + `yarn workspace web build` Pass (2026-05-19)

---

## Manual smoke test (after slices 1–9)

Run from repo root with dev server: `yarn workspace web dev` (or your usual `yd`).

| # | Area | Steps | Pass if |
| --- | --- | --- | --- |
| 1 | **App shell / theme** | Hard refresh; toggle dark mode in header; refresh again | No flash of light theme; mode persists |
| 2 | **Wallet load** | Generate or import mnemonic; add SOL + ETH wallet | Balances load without errors in console |
| 3 | **Network toggle (header)** | On a wallet card, toggle mainnet ↔ devnet (SOL) or mainnet ↔ sepolia (ETH) | Balance label/cluster updates; refresh still works |
| 4 | **Balance refresh** | Click refresh on wallet card | Spinner; balance updates; toast only on real failure |
| 5 | **Send modal** | Open Send; toggle cluster in modal; enter valid address + amount | No dead Scan QR / Import tabs; cluster matches header after toggle; validation messages show |
| 6 | **Send submit** | Send small test tx on devnet/sepolia (optional) | Success toast with tx id, or clear error toast |
| 7 | **History modal** | Open History; wait for list | Skeleton only when no cache; list appears; items animate on refresh |
| 8 | **History refresh** | Refresh in history modal | Spinner on button; list updates; balance quiet-refresh if history changed |
| 9 | **Cross-modal network** | Toggle network in Send, close, open History | History uses same cluster as header/send |
| 10 | **Receive** | Open Receive | QR / URI shows for current cluster |

**Regression signals (something broke):** React “hooks order” errors; balance stuck at `0` after toggle; history empty while header refresh shows txs; cluster in Send ≠ cluster in header.

---

## Session checklist (copy per PR)

- [ ] Slice ID and goal stated in PR title
- [ ] Only files for this slice changed
- [ ] `yarn workspace web lint`
- [ ] `yarn workspace web build`
- [ ] Smoke: load wallets → toggle network → refresh balance → open history → send modal
- [ ] This tracker updated (status + compliance table rows)
