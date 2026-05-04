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
| Complexity reduction in routing/handlers                                | In Progress | `packages/rust-apis/src/lib.rs`, `packages/rust-apis/src/api/wallet_routes.rs`                                                                      |
| Complexity reduction in transaction services                            | In Progress | `packages/rust-apis/src/services/solana_rpc.rs`, `packages/rust-apis/src/services/ethereum_rpc.rs`                                                  |
| Per-chain folder split (`chains/<newchain>/adapter.rs`)                 | Not Started | pending                                                                                                                                             |


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