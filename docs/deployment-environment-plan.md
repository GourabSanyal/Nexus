# Deployment & Environment Plan

Two-environment strategy for Nexus: **local dev** and **live production**.  
One shared Rust backend (Cloudflare Worker). Two frontend lifecycles on Vercel (`dev` branch → `main` branch).

---

## 1. Architecture at a glance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LOCAL DEV                                                                   │
│                                                                             │
│  Browser → localhost:3000/api/rust/*  →  wrangler dev :9000                 │
│            (same origin proxy)              (.dev.vars)                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LIVE — dev branch (pre-merge validation)                                    │
│                                                                             │
│  Browser → <preview-url>/api/rust/*  →  rust-apis.workers.dev (production)  │
│            Vercel Preview deploy          Cloudflare Worker (single prod)   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LIVE — main branch (production)                                             │
│                                                                             │
│  Browser → nexus-web-umber.vercel.app/api/rust/*  →  rust-apis.workers.dev  │
│            Vercel Production deploy                   Cloudflare Worker       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key rule:** The browser **never** calls `workers.dev` directly. It always calls `/api/rust` on whatever host it is on. CORS is not needed for normal app usage.

**Backend rule:** One Cloudflare Worker (`rust-apis.biz-gourab.workers.dev`) serves all live frontends (dev preview + main production). Local dev uses `wrangler dev` only on your machine.

---

## 2. Environment matrix

| Context | Git branch | Frontend | Backend | Config source |
|---|---|---|---|---|
| **Local dev** | any | `localhost:3000` (`next dev`) | `localhost:9000` (`wrangler dev`) | Committed defaults + gitignored secrets |
| **Live dev test** | `dev` | Vercel **Preview** URL | Production worker | Vercel Preview env + Cloudflare dashboard |
| **Live production** | `main` | Vercel **Production** URL | Production worker | Vercel Production env + Cloudflare dashboard |

### Variables by surface

| Variable | Local frontend | Local worker | Vercel Preview (`dev`) | Vercel Production (`main`) | Cloudflare Worker |
|---|---|---|---|---|---|
| `RUST_API_URL` | `.env.development` → `http://localhost:9000` | — | `https://rust-apis.biz-gourab.workers.dev` | `https://rust-apis.biz-gourab.workers.dev` | — |
| `SOLANA_*_RPC` | — | `.dev.vars` | — | — | Dashboard secrets |
| `ETHEREUM_*` | — | `.dev.vars` | — | — | Dashboard secrets |
| `CORS_ORIGIN` | — | optional / omit | — | — | **Remove** (not needed) |
| `NEXT_PUBLIC_RUST_API_URL` | **Remove** | — | **Remove** | **Remove** | — |

---

## 3. Already done ✅

These are implemented on the **`dev` branch** (`da677d5`). **`main` does not have them yet.**

| Item | Location | Status |
|---|---|---|
| Same-origin proxy `/api/rust/*` | `apps/web/next.config.mjs` | ✅ Done |
| Browser uses proxy path, server uses `RUST_API_URL` | `packages/api/src/utils/resolveRustApiBaseUrl.ts` | ✅ Done |
| `rustApiClient` wired to resolver | `packages/api/src/utils/rustApiClient.ts` | ✅ Done |
| Committed local frontend default | `apps/web/.env.development` | ✅ Done |
| Frontend env documentation | `apps/web/.env.example` | ✅ Done |
| Worker local secrets template | `packages/rust-apis/.dev.vars.example` | ✅ Done |
| `.dev.vars` gitignored | `packages/rust-apis/.gitignore` | ✅ Done |
| Comma-separated CORS resolver (fallback / direct calls) | `packages/rust-apis/src/cors.ts` | ✅ Done |
| CORS resolver wired in worker entry | `packages/rust-apis/src/index.ts` | ✅ Done |
| Unit tests for CORS + client URL resolution | `packages/rust-apis/tests/worker/cors.spec.ts`, `rust-api-client.spec.ts` | ✅ Done |
| README env section updated | `README.md` | ✅ Done |
| Changes committed & pushed to `origin/dev` | Git | ✅ Done |
| `main` branch untouched | Git | ✅ Safe |

### Not done yet (you will do these per slices below)

| Item | Status |
|---|---|
| Vercel Preview env: `RUST_API_URL` | ⬜ TODO |
| Vercel Production env: `RUST_API_URL` | ⬜ TODO (may already be set as `NEXT_PUBLIC_*`) |
| Remove `NEXT_PUBLIC_RUST_API_URL` from Vercel | ⬜ TODO |
| Remove `CORS_ORIGIN` from Cloudflare dashboard | ⬜ TODO |
| Deploy worker code from `dev` to production worker | ⬜ TODO |
| Live manual test on `dev` preview | ⬜ TODO |
| Merge `dev` → `main` | ⬜ TODO |
| Live manual test on `main` production | ⬜ TODO |

---

## 4. Slices (work in order)

### Slice A — Cloudflare Worker (production backend, one-time setup)

**Goal:** Production worker is ready and stays the single backend for all live frontends.

**Dashboard (Cloudflare → Workers → `rust-apis` → Settings → Variables):**

| Variable | Action | Value |
|---|---|---|
| `SOLANA_MAINNET_RPC` | Keep / set as secret | Your Alchemy URL |
| `SOLANA_DEVNET_RPC` | Keep / set as secret | Your Alchemy URL |
| `ETHEREUM_MAINNET` | Keep / set as secret | Your Alchemy URL |
| `ETHEREUM_SEPOLIA` | Keep / set as secret | Your Alchemy URL |
| `CORS_ORIGIN` | **Delete** | Not needed with proxy |

**Deploy worker from `dev` branch (updates WASM + proxy-related worker code):**

```bash
git checkout dev
cd packages/rust-apis
yarn deploy
```

**Verify worker directly (no browser, no CORS):**

```bash
curl -s https://rust-apis.biz-gourab.workers.dev/health
# Expected: {"service":"rust-apis","status":"ok","timestamp":...}
```

**Done when:** Health returns 200. `CORS_ORIGIN` is removed from dashboard.

---

### Slice B — Vercel environment variables

**Goal:** Preview (`dev` branch) and Production (`main` branch) each proxy to the production worker.

**Dashboard (Vercel → Project → Settings → Environment Variables):**

| Variable | Preview | Production | Development |
|---|---|---|---|
| `RUST_API_URL` | ✅ Set | ✅ Set | Optional (`http://localhost:9000` for `vercel dev`) |
| `NEXT_PUBLIC_RUST_API_URL` | ❌ Remove | ❌ Remove | ❌ Remove |

Value for Preview **and** Production:

```
RUST_API_URL=https://rust-apis.biz-gourab.workers.dev
```

> **Important:** `RUST_API_URL` must be checked for **Preview** — not only Production. Without it, `dev` branch preview builds fall back to `localhost:9000` at build time and the proxy breaks in live.

**Redeploy:** After changing env vars, trigger a new deploy (push to `dev` or redeploy from dashboard).

**Done when:** Both Preview and Production scopes have `RUST_API_URL` set; old `NEXT_PUBLIC_*` var removed.

---

### Slice C — Live test: `dev` branch (pre-merge)

**Goal:** Validate the full stack on a Vercel Preview URL before touching `main`.

**Trigger deploy:**

```bash
git checkout dev
git push origin dev   # if not already pushed
```

**Find preview URL:** Vercel dashboard → Deployments → latest `dev` deploy → Visit.

Expected URL pattern: `https://nexus-web-git-dev-<user>.vercel.app`

#### C.1 — Smoke tests (live dev)

| # | Test | How | Pass criteria |
|---|---|---|---|
| 1 | Proxy health | Browser or curl: `https://<preview-url>/api/rust/health` | JSON `{ "status": "ok", "service": "rust-apis" }` |
| 2 | No direct worker calls | DevTools → Network → any wallet action | Request URL contains `/api/rust/`, **not** `workers.dev` |
| 3 | No CORS errors | DevTools → Console | No `blocked by CORS policy` messages |
| 4 | App loads | Open preview URL | Wallet UI renders |

#### C.2 — Feature tests (live dev, manual)

| # | Feature | Steps | Pass criteria |
|---|---|---|---|
| 5 | Balances | Unlock vault → view SOL/ETH balance | Balances load (may show 0) |
| 6 | Import wallet | Import → enter seed → preview | `POST /api/rust/wallet/import-data` → 200, preview shows addresses |
| 7 | Send (testnet) | Send small tx on devnet/sepolia | Tx submits or clear validation error (not network/CORS) |
| 8 | History | Open history modal | Transactions load or empty state (not CORS/500) |
| 9 | Network toggle | Switch mainnet ↔ testnet | Balances refresh for selected network |

#### C.3 — DevTools checklist (live dev)

```
Network tab — import wallet request:
  ✅ Request URL:  https://<preview-url>/api/rust/wallet/import-data
  ✅ Status:       200 (or meaningful 4xx, not failed/CORS)
  ❌ Should NOT be: https://rust-apis.biz-gourab.workers.dev/...

Console:
  ✅ No CORS errors
  ❌ No "RUST_API_URL is required" errors
```

**Done when:** All smoke tests pass + import wallet works on preview URL.

---

### Slice D — Merge `dev` → `main`

**Goal:** Promote validated code to production frontend. Backend is already deployed from Slice A.

**Only after Slice C passes.**

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

Vercel auto-deploys `main` to Production URL (`nexus-web-umber.vercel.app`).

**Do not change Cloudflare** — same worker serves both.

**Done when:** `main` is pushed; Vercel Production deploy succeeds.

---

### Slice E — Live test: `main` branch (production)

**Goal:** Confirm production URL works identically to preview.

Production URL: `https://nexus-web-umber.vercel.app`

Repeat **the same test matrix as Slice C** on the production URL:

| # | Test | URL / action |
|---|---|---|
| 1 | Proxy health | `https://nexus-web-umber.vercel.app/api/rust/health` |
| 2 | No direct worker calls | DevTools Network |
| 3 | No CORS errors | DevTools Console |
| 4 | App loads | Production URL |
| 5–9 | Feature tests | Same as Slice C.2 |

**Done when:** Production matches preview behavior. `main` is the live release.

---

### Slice F — Local dev DX (ongoing, verify once)

**Goal:** Contributors clone and run without touching Cloudflare/Vercel.

**One-time local setup:**

```bash
# Worker secrets
cd packages/rust-apis
cp .dev.vars.example .dev.vars
# Edit .dev.vars — add Alchemy RPC keys

# Run (two terminals)
cd packages/rust-apis && yarn dev    # :9000
cd apps/web && yarn dev             # :3000
```

**Local verify:**

```bash
curl -s http://localhost:3000/api/rust/health
# Expected: {"status":"ok","service":"rust-apis",...}
```

| Check | Pass criteria |
|---|---|
| `apps/web/.env.development` exists | `RUST_API_URL=http://localhost:9000` |
| No `.env.local` required | App works out of the box |
| Browser calls `/api/rust/*` | Not `localhost:9000` directly |
| Worker reads `.dev.vars` | Balances / import work locally |

**Done when:** Fresh clone + two terminals = working app. No Cloudflare/Vercel config needed for local.

---

## 5. Branch & deploy workflow (summary)

```
┌──────────┐     push      ┌─────────────────┐     merge      ┌──────────┐
│  local   │ ────────────► │  dev (remote)   │ ─────────────► │   main   │
│  any     │               │  Vercel Preview │                │  Vercel  │
└──────────┘               └─────────────────┘                │ Production│
       │                              │                         └──────────┘
       │ wrangler dev                 │ Slice C tests                    │
       ▼                              ▼                                  ▼ Slice E tests
  localhost:9000              preview.vercel.app              nexus-web-umber.vercel.app
                                       │                                  │
                                       └──────────┬───────────────────────┘
                                                  ▼
                                    rust-apis.biz-gourab.workers.dev
                                    (single production worker)
```

| Action | Branch | Deploys to | Backend |
|---|---|---|---|
| `yarn dev` locally | any | localhost | `wrangler dev` |
| `git push origin dev` | `dev` | Vercel Preview | Production worker |
| `git push origin main` | `main` | Vercel Production | Production worker |
| `yarn deploy` (rust-apis) | deploy from active branch | Cloudflare Worker | Updates worker code |

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| CORS error on live URL | Old `main` code (no proxy) or browser hitting `workers.dev` | Confirm deploy is from `dev`/merged `main`; check Network tab URL |
| `/api/rust/health` → 404 | Rewrite not in deployed build | Redeploy; confirm `next.config.mjs` rewrites exist on branch |
| `/api/rust/health` → connection refused | `RUST_API_URL` missing or set to localhost on Vercel | Set `RUST_API_URL` for **Preview** and **Production** |
| Import wallet timeout | Worker/RPC slow (not CORS) | Check worker logs: `wrangler tail`; reduce candidates or increase timeout |
| Local works, live fails | Vercel env not set | Slice B |
| Preview works, production fails | Production env missing `RUST_API_URL` | Set Production scope in Vercel |
| `main` works, preview fails | Preview env missing `RUST_API_URL` | Set Preview scope in Vercel |

---

## 7. Post-merge cleanup (optional)

After Slice E passes:

- [ ] Confirm `NEXT_PUBLIC_RUST_API_URL` removed from Vercel all scopes
- [ ] Confirm `CORS_ORIGIN` removed from Cloudflare
- [ ] Delete stale local overrides if you manually changed `.dev.vars` for prod testing
- [ ] Update Vercel Production Branch setting remains `main` (default)

---

## 8. Quick reference commands

```bash
# Local dev
cd packages/rust-apis && yarn dev
cd apps/web && yarn dev

# Deploy worker (from dev or main — same production target)
cd packages/rust-apis && yarn deploy

# Push dev for preview test
git push origin dev

# Merge to main after preview tests pass
git checkout main && git merge dev && git push origin main

# Live health checks
curl https://<preview-or-prod-url>/api/rust/health
curl https://rust-apis.biz-gourab.workers.dev/health
```

---

## 9. Slice tracker

| Slice | Description | Status |
|---|---|---|
| **A** | Cloudflare worker setup + deploy | ⬜ TODO |
| **B** | Vercel env vars (Preview + Production) | ⬜ TODO |
| **C** | Live manual test — `dev` preview | ⬜ TODO |
| **D** | Merge `dev` → `main` | ⬜ TODO |
| **E** | Live manual test — `main` production | ⬜ TODO |
| **F** | Local dev DX verification | ⬜ TODO |
| **Code** | Proxy + env architecture on `dev` branch | ✅ Done |

Start with **Slice A**, then **B**, then **C**. Do not merge until **C** is green.
