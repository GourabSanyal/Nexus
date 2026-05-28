# Transaction History — Cache & Rendering

How the wallet's transaction history list works end-to-end.

## What the cache is

- A **per-wallet + per-cluster** list of transactions, kept on the **frontend only**.
- Lives in the Recoil atom `transactionHistoryState` (`packages/store/src/atoms/transactionHistoryState.ts`).
- Auto-persisted to local storage via `persistAtom`.
- Shape:

```ts
Record<
  walletId,        // e.g. "1"
  Record<
    cluster,       // e.g. "mainnet", "devnet", "sepolia"
    {
      transactions: TransactionInfo[];
      pagination: PaginationInfo | null;
    }
  >
>
```

- The server is **stateless**. It only fetches from the chain RPC and returns results.

## How fetching works

The frontend supports three fetch modes, all going through `IWalletAdapter.fetchTransactions`:

### 1. Initial fetch (no cache)

- Triggered when the history modal opens and the cache is empty.
- Sends `limit=20`, no cursor.
- Server returns the **newest 20** transactions.

### 2. Incremental sync (cache exists)

- Triggered on refresh or modal open with cache present.
- Sends `untilSignature` = newest cached signature.
- Server walks newest → older and **stops** at that signature.
- Result is **prepended** to the cache (with signature dedupe).
- If nothing new exists on chain, server returns an empty list.

### 3. Load more (pagination)

- Triggered when user clicks "Load More".
- Sends `cursor` = oldest cached signature.
- Server returns the **next page of older** transactions.
- Result is **appended** to the cache (with signature dedupe).

## How transactions render

- The history modal reads `currentTransactions` from `useTransactionHistoryDisplay`.
- The list is wrapped in `<AnimatePresence>` with each item using `layout="position"`.
- Each item keyed by `tx.signature` (stable across refreshes).
- `TransactionItem` is `React.memo`'d → it does **not** re-render unless its own data changes.

When a new transaction arrives:

- The new item mounts at the top with `height: 0 → auto`.
- Existing items slide down via a spring `layout` animation.
- Existing items do **not** re-render at all.

## Files map

### Frontend

| Purpose                        | File                                                              |
| ------------------------------ | ----------------------------------------------------------------- |
| Recoil cache atom              | `packages/store/src/atoms/transactionHistoryState.ts`             |
| Cache types                    | `packages/api/src/types/TransactionTypes.ts`                      |
| Cache read/write helpers       | `apps/web/app/components/ui/wallet/modals/utils/transactionHistoryCache.ts` |
| Public fetch API               | `apps/web/app/lib/services/transactionHistoryFetch.ts`            |
| Fetch runners (incr + loadMore)| `apps/web/app/lib/services/transactionHistoryRunners.ts`          |
| In-memory subscribers          | `apps/web/app/lib/services/transactionHistorySubscriptions.ts`    |
| Modal orchestration hook       | `apps/web/app/components/ui/wallet/modals/hooks/useTransactionHistoryFetch.ts` |
| Load-more hook                 | `apps/web/app/components/ui/wallet/modals/hooks/useLoadMoreTransactions.ts` |
| List rendering                 | `apps/web/app/components/ui/wallet/modals/HistoryModal.tsx`       |
| Item rendering (memoized)      | `apps/web/app/components/ui/wallet/modals/components/TransactionItem.tsx` |

### Backend

| Purpose                          | File                                                       |
| -------------------------------- | ---------------------------------------------------------- |
| Route handler                    | `packages/rust-apis/src/api/wallet/transactions.rs`        |
| Shared fetch options             | `packages/rust-apis/src/chains/transaction_options.rs`     |
| Solana fetch options             | `packages/rust-apis/src/services/solana_fetch_options.rs`  |
| Ethereum fetch options           | `packages/rust-apis/src/services/ethereum_fetch_options.rs`|
| Solana RPC                       | `packages/rust-apis/src/services/solana_rpc.rs`            |
| Ethereum RPC                     | `packages/rust-apis/src/services/ethereum_rpc.rs`          |

## Request → response example

**Incremental sync request** (frontend → backend):

```json
{
  "address": "cBXvXnd8cUdyuNaUjdeakEWZ42Wbh5bhwpeMC5FSdRP",
  "cluster": "devnet",
  "limit": 20,
  "untilSignature": "5oPFriZ6...fv1VoDEw"
}
```

**Response:**

```json
{
  "transactions": [ /* only txs newer than 5oPFriZ6... */ ],
  "pagination": { "has_more": false, "next_cursor": null, "limit": 20 }
}
```

## Why it works this way

- **Cache lives on the client** → server stays stateless and lean.
- **Cursor-based pagination** → no full re-fetch on refresh.
- **Stable signatures as keys** → memo + Framer Motion can skip re-renders.
- **Dedicated runner modules** → each function stays small and easy to test.
