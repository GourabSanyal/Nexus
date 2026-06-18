# Rust Backend Rules

This document is the source of truth for maintaining code quality, modularity, and chain extensibility in `packages/rust-apis`.

## Architecture Rules

- Keep chain logic behind `BlockchainAdapter`; route handlers must not contain chain-specific RPC logic.
- Use shared transport only from `services/rpc_client.rs`; never import one chain service from another.
- Chain registration must go through `ChainRegistry::register(...)`; avoid hardcoded `match` trees for chain selection.
- Route dispatch stays thin; parsing/validation/error mapping belong in focused helper functions.
- Keep Express backend read-only during migration; all new migration logic goes to Rust backend.

## Complexity and Size Rules

- Target cyclomatic complexity `<= 5` per function. Split functions when branching grows.
- Keep non-generated files `<= 150` LOC where practical; split by responsibility early.
- Prefer small pure helpers over nested `if/else` blocks.
- Avoid stringly-typed control flow where typed enums/errors are possible.

## Env and Config Rules

- Source RPC URLs from env-driven headers injected by Worker entrypoint:
  - Solana: `SOLANA_MAINNET_RPC`, `SOLANA_DEVNET_RPC`
  - Ethereum: `ETHEREUM_MAINNET` / `ETHEREUM_MAINNET_RPC`, `ETHEREUM_SEPOLIA` / `ETHEREUM_SEPOLIA_RPC`
- Respect comma-separated `CORS_ORIGIN`; resolve against the request `Origin` in `src/cors.ts` before setting `x-cors-origin`.
- Request body `rpcUrl` may override env only when explicitly provided.

## Adding a New Blockchain (Checklist)

1. Add adapter implementation at `chains/<newchain>/adapter.rs` (or equivalent split).
2. Add chain RPC service at `services/<newchain>_rpc.rs` (or shared EVM base extension).
3. Add env mappings in `src/env.ts` and header resolution in API route helpers.
4. Register adapter via `ChainRegistry::register(...)`.
5. Add/extend route handlers without adding chain conditionals in `lib.rs`.
6. Add parity fixture and update `docs/migration/rust-migration-tracker.md`.
7. Add tests for happy path + edge cases before marking slice done.

## Testing and Quality Gates

- Required local checks before handoff:
  - `cargo check`
  - `cargo fmt --check`
  - `cargo clippy -- -D warnings`
  - `cargo test`
- Each migration slice is complete only after parity evidence + tests are documented in tracker.

## Change Management Rules

- Update `docs/migration/rust-migration-tracker.md` after every substantial Rust backend change.
- Prefer incremental refactors over large rewrites.
- Keep public API contracts backward-compatible during migration unless explicitly approved.