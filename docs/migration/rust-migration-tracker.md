# Rust Migration Tracker

## Migration Rules

- Migrate in locked slice order from the execution plan.
- Keep `packages/api` read-only during migration.
- Each slice must include parity fixture + tests before next slice.
- Prefer modular Rust boundaries: `api`, `handlers`, `chains`, `services`, `models`.
- Keep non-generated files at `<=150` LOC when adding new code.
- Update this tracker before ending each session.

## Quick Snapshot

### Migration Status Table


| Slice                    | State       | Notes                                                                    |
| ------------------------ | ----------- | ------------------------------------------------------------------------ |
| health                   | In Progress | test left: backend/frontend assertions and method/path edge validation    |
| solana-balance           | In Progress | test left: parity fixture capture + backend/frontend balance tests        |
| ethereum-balance         | In Progress | test left: parity fixture + edge-case tests after route wiring validation |
| solana-tx-history        | Not Started | queued                                                                   |
| solana-send              | Not Started | queued                                                                   |
| ethereum-tx-history      | Not Started | queued                                                                   |
| ethereum-send            | Not Started | queued                                                                   |
| wallet-generation-import | Not Started | queued                                                                   |
| gateway-cutover          | Not Started | queued                                                                   |
| cleanup-and-polish       | Not Started | queued                                                                   |


### Work Buckets


| Bucket          | Items                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| Done            | compile restored (`cargo check` passes), chain registry includes solana + ethereum, balance routes wired in `lib.rs` |
| Running         | health slice, solana-balance slice, ethereum-balance groundwork (all with tests left)                                |
| To Be Done Next | capture balance parity fixtures, add health/balance backend + integration tests, then mark slices ready for testing   |


### Architecture Refactor Progress


| Refactor Item                                                           | Status      | Files                                                                                                                                               |
| ----------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared neutral RPC transport (`rpc_client`)                             | Done        | `packages/rust-apis/src/services/rpc_client.rs`, `packages/rust-apis/src/services/solana_rpc.rs`, `packages/rust-apis/src/services/ethereum_rpc.rs` |
| Chain registry registration pattern (`register`)                        | Done        | `packages/rust-apis/src/chains/registry.rs`                                                                                                         |
| Env header support for Ethereum (`ETHEREUM_MAINNET`/`ETHEREUM_SEPOLIA`) | Done        | `packages/rust-apis/src/env.ts`, `packages/rust-apis/src/api/wallet_routes.rs`                                                                      |
| Complexity reduction in routing/handlers                                | Done        | `packages/rust-apis/src/lib.rs` (168 → 42 LOC), `packages/rust-apis/src/worker/{http,routes}.rs`, `packages/rust-apis/src/wasm_exports.rs`           |
| Complexity reduction in transaction services                            | Done        | `packages/rust-apis/src/services/solana_rpc/{balance,signatures,parser,details,send,mod}.rs` (368 → 6 files, max 136 LOC), `packages/rust-apis/src/services/ethereum_rpc/{balance,transactions,parser,send,mod}.rs` (241 → 5 files, max 116 LOC) |
| Shared RPC envelope helper (`json_rpc_call`)                            | Done        | `packages/rust-apis/src/services/rpc_client.rs`                                                                                                     |
| Shared parsing utility (`value_as_string`)                              | Done        | `packages/rust-apis/src/services/util.rs`                                                                                                           |
| Centralised tx-limit clamping (`TransactionFetchOptions::effective_limit`) | Done     | `packages/rust-apis/src/chains/transaction_options.rs`, `packages/rust-apis/src/chains/{solana,ethereum}.rs`                                        |
| Cursor-based transaction pagination (`cursor`, `untilSignature`)        | Done        | `packages/rust-apis/src/api/wallet/{body,transactions}.rs`, `packages/rust-apis/src/chains/{traits,transaction_options,solana,ethereum}.rs`, `packages/rust-apis/src/services/{solana_rpc,ethereum_rpc,solana_fetch_options,ethereum_fetch_options}.rs` |
| Per-chain folder split (`chains/<newchain>/adapter.rs`)                 | Not Started | pending                                                                                                                                             |
| Dead/empty module removal (G1)                                          | Done        | removed `src/config.rs`, `src/handlers/{mod,wallet_handler,transaction_handler}.rs`, `src/api/history_rooutes.rs`, `src/models/wallet.rs`; cleaned `lib.rs` / `api/mod.rs` / `models/mod.rs` |


## Slice Ledger

### Slice: health

- Migration PR/commit: local working tree (uncommitted)
- Status: In Progress
- Rust implementation files:
  - `packages/rust-apis/src/lib.rs`
- Express baseline reference (read-only):
  - `packages/api/src/server.ts`
- Parity fixture path:
  - `docs/migration/parity/health-response-fixture.json`

#### Manual tests for you to write

- Backend test files to update/create:
  - `packages/rust-apis/tests/wallet/health_tests.rs`
- Frontend test files to update/create:
  - `apps/web/tests/integration/health-route.test.ts`

#### Edge cases to cover

- success response
- method mismatch
- malformed path

#### Run and record

- Commands run:
  - `cargo check`
- Result:
  - Pass (compile), tests pending
- Notes:
  - test left: fixture exists, but backend + frontend assertions are still pending.

#### Next handoff

- Next file to edit: `packages/rust-apis/tests/wallet/health_tests.rs`
- Next command to run: `cargo test`

### Slice: solana-balance

- Migration PR/commit: local working tree (uncommitted)
- Status: In Progress
- Rust implementation files:
  - `packages/rust-apis/src/api/wallet_routes.rs`
  - `packages/rust-apis/src/chains/traits.rs`
  - `packages/rust-apis/src/chains/solana.rs`
  - `packages/rust-apis/src/chains/registry.rs`
  - `packages/rust-apis/src/services/solana_rpc.rs`
- Express baseline reference (read-only):
  - `packages/api/src/routes`
- Parity fixture path:
  - `docs/migration/parity/` (health exists; solana balance fixture pending)

#### Manual tests for you to write

- Backend test files to update/create:
  - `packages/rust-apis/tests/wallet/balance_tests.rs`
- Frontend test files to update/create:
  - `apps/web/tests/integration/solana-balance.test.ts`

#### Edge cases to cover

- valid address
- invalid address
- unsupported network
- RPC timeout/failure

#### Run and record

- Commands run:
  - `cargo check`
- Result:
  - Pass (compile), parity + tests pending
- Notes:
  - test left: route is completed (`rpcUrl` alias support, cluster validation, stable response shape), but parity fixture + edge-case test assertions are still pending.

#### Next handoff

- Next file to edit: `docs/migration/parity/solana-balance-response-fixture.json`
- Next command to run: `cargo test`

### Slice: ethereum-balance (mid-way adapter work)

- Migration PR/commit: local working tree (uncommitted)
- Status: In Progress
- Rust implementation files:
  - `packages/rust-apis/src/chains/ethereum.rs`
  - `packages/rust-apis/src/services/ethereum_rpc.rs`
  - `packages/rust-apis/src/services/mod.rs`
  - `packages/rust-apis/src/chains/mod.rs`
  - `packages/rust-apis/src/chains/registry.rs`
- Express baseline reference (read-only):
  - `packages/api/src/routes`
- Parity fixture path:
  - pending

#### Manual tests for you to write

- Backend test files to update/create:
  - `packages/rust-apis/tests/wallet/balance_tests.rs`
- Frontend test files to update/create:
  - `apps/web/tests/integration/ethereum-balance.test.ts`

#### Edge cases to cover

- valid address
- invalid address
- unsupported network
- RPC timeout/failure

#### Run and record

- Commands run:
  - `cargo check`
- Result:
  - Pass (compile), route wired but parity not started
- Notes:
  - test left: adapter/service scaffolding is stable and `wallet/ethereum/balance` is wired in `lib.rs`, but parity fixture and edge-case test assertions are still pending.

#### Next handoff

- Next file to edit: `packages/rust-apis/src/lib.rs`
- Next command to run: `cargo test`

## Decision Log

- 2026-04-29: Added Ethereum chain adapter and RPC service scaffold before endpoint wiring.
  - Rationale: establish ChainRegistry extensibility and unblock compile-level integration.
  - ADR link: pending `docs/adr/ADR-002-chain-registry.md`
- 2026-04-29: Removed wildcard service re-exports and switched to explicit module paths.
  - Rationale: avoid symbol ambiguity between Solana/Ethereum RPC helpers.
  - ADR link: pending
- 2026-05-27: Refactored `services/solana_rpc.rs` (368 LOC) and `services/ethereum_rpc.rs` (241 LOC) into per-responsibility submodule folders (`balance`, `signatures`/`transactions`, `parser`, `details` (solana only), `send`) with `mod.rs` re-exporting the public API. No call-site changes required.
  - Rationale: enforce Rules.md `<= 150` LOC + single-responsibility constraints; allow each chain service to evolve independently behind the existing `BlockchainAdapter` strategy boundary.
  - ADR link: pending
- 2026-05-27: Lifted JSON-RPC envelope (`json_rpc_call`) into shared `services/rpc_client.rs` and the `value_as_string` parse-or-error helper into `services/util.rs`; centralised tx-limit clamping into `TransactionFetchOptions::effective_limit()` (used by both chain adapters and the direct WASM export). Chain `*FetchOptions.limit` is now a pre-clamped `usize` instead of `Option<usize>`.
  - Rationale: eliminate the only genuine cross-chain duplication (the 4× repeated `unwrap_or(20).min(100)` and the repeated `result.as_str().map(...).ok_or_else(...)` pattern) without violating Rules.md "avoid hardcoded `match` trees for chain selection" / "never import one chain service from another".
  - ADR link: pending
- 2026-05-27: Split `lib.rs` (168 LOC) into a thin crate entry (`lib.rs` 42 LOC) + `worker/{http,routes}.rs` (HTTP plumbing + dispatch table) + `wasm_exports.rs` (direct `#[wasm_bindgen]` JS exports).
  - Rationale: separate Cloudflare Worker concerns from direct-WASM concerns; new routes/chains/exports no longer need to touch the crate root.
  - ADR link: pending
- 2026-05-27: Removed dead/empty modules: `src/config.rs`, `src/handlers/{mod,wallet_handler,transaction_handler}.rs`, `src/api/history_rooutes.rs` (typo file), and `src/models/wallet.rs`. Cleaned up parent declarations in `lib.rs`, `api/mod.rs`, and `models/mod.rs`.
  - Rationale: every deleted file was a comment-only placeholder with no callers; keeping them inflated the module graph and signalled work that no longer exists.
  - ADR link: pending

## Edge-Case Coverage Matrix

- `health`: identified, tests pending
- `solana-balance`: identified, tests pending
- `solana-tx-history`: pending
- `solana-send`: pending
- `ethereum-balance`: identified, tests pending
- `ethereum-tx-history`: pending
- `ethereum-send`: pending
- `wallet-generation-import`: pending
- `gateway-cutover`: pending

## Risks and Blockers

- No committed parity fixtures yet for `solana-balance` and `ethereum-balance`.
- Current Rust routes are still partially wired in `lib.rs` with placeholder flows.
- CI gates from the plan are not yet fully configured in this repository.

## Handoff Note

- Current state: compile restored for in-flight adapter work.
- Next file to edit: `docs/migration/parity/solana-balance-response-fixture.json`
- Next command to run: `cargo test`
- Recommended immediate action:
  - Capture `solana-balance` parity fixture.
  - Add `health` and `balance` backend tests.
  - Mark `solana-balance` as `Ready for Your Tests`.