Nexus — Multi-Chain Wallet Infrastructure
Nexus is a production-grade, open-source web based wallet platform built for the modern multi-chain world. It delivers seamless Ethereum and Solana support, letting you send, receive, and manage assets across both networks from a single, unified interface.

Overview
Built as a TypeScript monorepo with a high-performance Rust backend, powered by Turborepo, Nexus enforces strict separation of concerns across every layer. Designed from the ground up for scalability, security, and clean developer ergonomics. Whether you're integrating wallet infrastructure into your product or evaluating how modern Web3 architecture should be structured, Nexus is built to production standards.

## Architecture

``` mermaid
%%{init: {'theme':'base','themeVariables':{
  'primaryColor':'#0f172a','primaryTextColor':'#f1f5f9','primaryBorderColor':'#475569',
  'lineColor':'#94a3b8','clusterBkg':'#111827','clusterBorder':'#334155',
  'fontFamily':'Inter, system-ui, sans-serif','fontSize':'16px'
}}}%%
flowchart LR

    User(["👤  User"])

    subgraph Vercel["▲  Vercel<br/>apps/web · Next.js"]
        direction TB
        UI["Wallet UI"]
        Features["Generate · Import · Send<br/>Receive · History · Balances"]

        subgraph BIP["📜  BIP standards · key derivation"]
            direction LR
            B39["BIP-39<br/><i>12/24 word mnemonic<br/>generate · validate · seed</i>"]
            B44["BIP-44 paths<br/><i>SOL m/44'/501'/n'/0'<br/>ETH m/44'/60'/n'/0/0</i>"]
            B32["BIP-32 / SLIP-10<br/><i>ed25519 · secp256k1</i>"]
        end

        subgraph Vault["🔐  Local encryption · walletVault"]
            direction LR
            KDF["Argon2id<br/>key derivation<br/><i>password → vault key</i>"]
            AES["AES-GCM<br/><i>Web Crypto<br/>API</i>"]
            Env[("localStorage<br/><i>encrypted vault<br/>mnemonic + keys</i>")]
            KDF --> AES --> Env
        end

        Sign["Tx signing<br/><i>ethers.js · @solana/web3.js</i>"]

        UI --> Features
        Features --> BIP
        BIP --> Sign
        Features --> Vault
        Features --> Sign
    end

    subgraph CF["☁️  Cloudflare Workers<br/>packages/rust-apis"]
        direction LR
        Shim["JS shim<br/>index.ts<br/><i>env bindings to<br/>request headers</i>"]
        WASM["Rust → WASM<br/>handle_request<br/><i>lib.rs · CORS</i>"]
        Router["Router<br/>routes.rs<br/><i>POST /wallet/:chain/*</i>"]
        Registry["ChainRegistry<br/><i>strategy dispatch</i>"]
        SolAd["Solana<br/>Adapter"]
        EthAd["Ethereum<br/>Adapter"]
        RpcSvc["json_rpc_call<br/><i>balance · txs · send<br/>import scan</i>"]
        Secrets[["wrangler secrets<br/><i>SOLANA RPC URLs<br/>ETH RPC URLs</i>"]]

        Shim --> WASM --> Router --> Registry
        Registry --> SolAd & EthAd
        SolAd & EthAd --> RpcSvc
        Secrets -.injects.-> RpcSvc
    end

    subgraph RPC["🌐  Alchemy<br/>RPC"]
        Chains["Ethereum<br/>+ Solana<br/><i>mainnet · testnets</i>"]
    end

    User --> UI
    Sign ==>|"HTTPS<br/>signed txs only"| Shim
    Features ==>|"HTTPS<br/>addresses only<br/>import preview"| Shim
    RpcSvc ==>|JSON-RPC| Chains

    Note["🛡️  Security<br/>Keys never leave browser<br/>unencrypted at rest<br/>Backend receives<br/>addresses or signed txs"]
    Vault -.- Note

    classDef user   fill:#1e293b,stroke:#3b82f6,color:#f1f5f9,stroke-width:2px
    classDef fe     fill:#0f172a,stroke:#06b6d4,color:#e0f2fe,stroke-width:2px
    classDef bip    fill:#1e1b4b,stroke:#a855f7,color:#f3e8ff,stroke-width:2px
    classDef vault  fill:#3f2d0f,stroke:#f59e0b,color:#fef3c7,stroke-width:2px
    classDef be     fill:#0f172a,stroke:#10b981,color:#d1fae5,stroke-width:2px
    classDef ext    fill:#3f1d1d,stroke:#ef4444,color:#fecaca,stroke-width:2px
    classDef sec    fill:#3f2d0f,stroke:#f59e0b,color:#fef3c7,stroke-width:1.5px

    class User user
    class UI,Features,Sign fe
    class B39,B44,B32 bip
    class KDF,AES,Env vault
    class Shim,WASM,Router,Registry,SolAd,EthAd,RpcSvc,Secrets be
    class Chains ext
    class Note sec

```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion |
| State Management | Recoil |
| API Layer | Express.js (TypeScript), Rust (Axum), Alchemy gRPCs | 
| Blockchain | Solana SDK, Ethers.js |
| Build Tools | Turborepo, Yarn Workspaces |

## Key Features

- **Multi-chain Support**: Ethereum (Mainnet, Sepolia, Holesky) and Solana (Mainnet, Devnet)
- **Wallet Generation**: BIP-39 seed phrase based wallet creation
- **Balance Fetching**: Real-time on-chain balance queries
- **Transaction History**: View past transactions on both chains
- **Network Switching**: Easy network toggle between testnets and mainnets

## Prerequisites

- Node.js 18+
- Rust (latest stable)
- Yarn 4.x
- Alchemy or similar RPC provider account

## Setup

### 1. Install Dependencies

```bash
# Root workspace
yarn install
```

### 2. Configure Environment Variables

Create `.env` files in the following locations:

**`packages/api/.env`**
```env
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_RUST_API_URL=http://localhost:9000
NEXT_PUBLIC_API_URL=http://localhost:3001
ETHEREUM_MAINNET=<your-alchemy-url>
ETHEREUM_SEPOLIA=<your-alchemy-url>
ETHEREUM_HOLESKY=<your-alchemy-url>
```

**`packages/rust-apis/.env`**
```env
PORT=9000
CORS_ORIGIN=http://localhost:3000
SOLANA_MAINNET_RPC=<your-alchemy-url>
SOLANA_DEVNET_RPC=<your-alchemy-url>
```

**`apps/web/.env`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RUST_API_URL=http://localhost:9000
```

> **Note**: Obtain RPC URLs from [Alchemy](https://www.alchemy.com/) or similar providers. Free tiers are available for development.

### 3. Run Development Servers

```bash
# Terminal 1 - Rust API (Solana)
cd packages/rust-apis && wranger dev

# Terminal 2 - TypeScript API (Ethereum)
cd packages/api && yarn start

# Terminal 3 - Frontend
cd apps/web && yarn dev
```

### Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| TypeScript API | 3001 | http://localhost:3001 |
| Rust API | 9000 | http://localhost:9000 |

## Project Structure

```
├── apps/
│   └── web/                 # Next.js frontend
├── packages/
│   ├── api/                 # Express.js API (Ethereum)
│   ├── rust-apis/           # Axum Rust API (Solana)
│   ├── store/               # Shared Recoil state
│   ├── ui/                  # Shared UI components
│   └── zod/                 # Validation schemas
```

## Design Principles

1. **Adapter Pattern**: Chain-specific logic encapsulated in wallet adapters
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **Separation of Concerns**: Clear boundaries between layers
4. **Monorepo Efficiency**: Shared code via Yarn workspaces

## License

MIT
