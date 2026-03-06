Nexus — Multi-Chain Wallet Infrastructure
Nexus is a production-grade, open-source web based wallet platform built for the modern multi-chain world. It delivers seamless Ethereum and Solana support, letting you send, receive, and manage assets across both networks from a single, unified interface.

Overview
Built as a TypeScript monorepo with a high-performance Rust backend, powered by Turborepo, Nexus enforces strict separation of concerns across every layer. Designed from the ground up for scalability, security, and clean developer ergonomics. Whether you're integrating wallet infrastructure into your product or evaluating how modern Web3 architecture should be structured, Nexus is built to production standards.

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
cd packages/rust-apis && cargo run --release

# Terminal 2 - TypeScript API (Ethereum)
cd packages/api && yarn dev

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
