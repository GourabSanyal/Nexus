# Cloudflare Workers Deployment Guide

This Rust backend has been rewritten to run on **Cloudflare Workers**, replacing the previous Tokio/Axum-based server.

## Key Changes

- **Removed Dependencies**: `tokio`, `axum`, `tower-http`, `dotenv`
- **New Dependencies**: `worker` crate for Cloudflare Workers
- **No Server Binding**: Replaces `TcpListener` and async runtime with Cloudflare's event-driven architecture
- **Environment Configuration**: Moves from `std::env` to Cloudflare Worker secrets/bindings
- **WASM Compilation**: Rust code compiles to WebAssembly for execution in Workers runtime

## Local Development

### Prerequisites

1. Install Rust: https://rustup.rs/
2. Install Wrangler CLI: `npm install -g wrangler`
3. Configure Cloudflare account: `wrangler login`

### Setup Environment Variables

Create a `.env` file locally (or set secrets for production):

```bash
# For local development with wrangler dev
wrangler secret put SOLANA_MAINNET_RPC
wrangler secret put SOLANA_DEVNET_RPC
```

When prompted, enter the respective RPC URLs:
- Mainnet: `https://api.mainnet-beta.solana.com`
- Devnet: `https://api.devnet.solana.com`

### Run Locally

```bash
# Start local development server
wrangler dev

# Server will be available at http://localhost:8787
```

### Test Endpoints

```bash
# Health check
curl http://localhost:8787/health

# Get Solana balance
curl -X POST http://localhost:8787/wallet/solana/balance \
  -H "Content-Type: application/json" \
  -d '{
    "address": "YOUR_SOLANA_ADDRESS",
    "cluster": "devnet"
  }'

# Get Solana transactions
curl -X POST http://localhost:8787/wallet/solana/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "address": "YOUR_SOLANA_ADDRESS",
    "cluster": "devnet",
    "limit": 20
  }'
```

## Deployment to Cloudflare

### Build

```bash
# Build for WASM
wrangler publish
```

This will:
1. Compile Rust to WASM
2. Optimize the bundle
3. Deploy to Cloudflare Workers

### Set Production Secrets

```bash
# Set secrets in production environment
wrangler secret put SOLANA_MAINNET_RPC --env production
wrangler secret put SOLANA_DEVNET_RPC --env production
```

### Configure Custom Domain (Optional)

Update `wrangler.toml`:

```toml
[env.production]
route = "https://api.yourdomain.com/*"
```

## Environment Variables

Unlike the old setup, environment variables are now configured via Cloudflare:

### Local Development
- Use `wrangler secret put` or create a `.dev.vars` file

### Production
- Set via Cloudflare dashboard → Workers → Settings → Environment Variables/Secrets
- Or use `wrangler secret put --env production`

## CORS Configuration

CORS headers are configured in `main.rs` with permissive defaults:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

Modify these in the `get_cors_headers()` function for stricter policies.

## Troubleshooting

### Build Fails
```bash
# Clear build cache
cargo clean
wrangler build
```

### Runtime Errors
```bash
# View logs
wrangler tail
```

### Dependencies Issue
- Solana client crates must be compatible with WASM
- If issues persist, consider using HTTP clients (like `reqwest`) with WASM support instead

## API Endpoints

All endpoints are POST unless specified:

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | - | "Hello from Cloudflare Worker..." |
| GET | `/health` | - | `{ "status": "ok", "service": "rust-apis", "timestamp": ... }` |
| POST | `/wallet/solana/balance` | `{ "address": string, "cluster": string }` | `{ "balance": u64 }` |
| POST | `/wallet/solana/transactions` | `{ "address": string, "cluster": string, "limit"?: number }` | `{ "transactions": [...], "pagination"?: {...} }` |

## Performance Notes

- Cloudflare Workers have a 30-second CPU timeout per request
- Large transaction queries may timeout; limit is capped at 100
- WASM cold starts: ~50-100ms, cached: <1ms

## Next Steps

1. ✅ Local testing with `wrangler dev`
2. ✅ Test all endpoints with sample data
3. ⚠️ Deploy to production with `wrangler publish`
4. ⚠️ Monitor performance and errors with `wrangler tail`
5. ⚠️ Set up error tracking (Sentry, Axiom, etc.)
