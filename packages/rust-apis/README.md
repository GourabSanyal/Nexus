# rust-apis Worker Runbook

This package runs a Cloudflare Worker (`src/index.ts`) that calls Rust WASM exports from `src/lib.rs`.

## Architecture

- Worker adapter: `src/index.ts`
- Rust/WASM core: `src/lib.rs` and Rust modules
- Generated WASM artifacts: `_wasm/`
- Deploy config: `wrangler.toml`

Goal during migration: keep TypeScript as thin transport glue and move route/business logic into Rust modules.

## Prerequisites

- Node 18+
- Yarn 4
- Rust toolchain
- `wasm32-unknown-unknown` target
- `wasm-bindgen` CLI
- Wrangler login

Setup commands:

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli
wrangler login
```

## Local Development

Run Worker locally:

```bash
yarn dev
```

Default local port is configured in `wrangler.toml` (`[dev] port = 9000`).

Health checks:

```bash
curl http://localhost:9000/
curl http://localhost:9000/health
```

## Environment and Secrets

Use Wrangler secrets for sensitive RPC values.

Examples:

```bash
wrangler secret put SOLANA_MAINNET_RPC --env production
wrangler secret put SOLANA_DEVNET_RPC --env production
wrangler secret put SOLANA_MAINNET_RPC --env development
wrangler secret put SOLANA_DEVNET_RPC --env development
```

Do not hardcode production secrets in code or `wrangler.toml`.

## Quality Gate Before Deploy

Run:

```bash
yarn check
```

This executes:

- `cargo fmt --check`
- `cargo clippy -- -D warnings`
- `cargo test`

## Preview and Deployment

Production-like local preview:

```bash
yarn preview
```

Deploy:

```bash
yarn deploy
```

Deploy to explicit production env:

```bash
yarn deploy:production
```

## Post-Deploy Smoke Tests

After deploy, verify:

- `GET /health` returns `status: ok`
- migrated slice endpoint returns expected shape
- no unexpected Worker errors in logs

## Rollback Strategy

During migration, keep Express fallback available.

If a Rust slice fails in live:

1. route traffic to fallback path
2. log failing request/response in tracker
3. fix in Rust branch
4. redeploy and re-run smoke tests

## Migration Discipline

- Migrate one slice at a time (per tracker)
- Mark a slice `Ready for Your Tests` only after parity fixture is in place
- Mark `Done` only after manual tests pass and tracker is updated
