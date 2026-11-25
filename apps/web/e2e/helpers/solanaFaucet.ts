import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const DEVNET_RPC =
  process.env.E2E_SOLANA_DEVNET_RPC ?? clusterApiUrl("devnet");

export function getDevnetConnection(): Connection {
  return new Connection(DEVNET_RPC, "confirmed");
}

function parseFunderSecret(raw: string): Keypair {
  const trimmed = raw.trim();

  if (trimmed.startsWith("[")) {
    const bytes = Uint8Array.from(JSON.parse(trimmed) as number[]);
    return Keypair.fromSecretKey(bytes);
  }

  return Keypair.fromSecretKey(bs58.decode(trimmed));
}

/**
 * Fund a devnet address from `E2E_SOLANA_FUNDER_SECRET`.
 *
 * Public `requestAirdrop` on api.devnet.solana.com is closed (HTTP 410).
 * Fund the keypair once at https://faucet.solana.com, then reuse it in tests.
 *
 * Secret formats:
 * - base58 secret key
 * - JSON byte array from `solana-keygen` (`[1,2,...]`)
 */
export async function fundDevnetSol(
  address: string,
  sol = 0.05
): Promise<string> {
  const secret = process.env.E2E_SOLANA_FUNDER_SECRET;
  if (!secret) {
    throw new Error(
      [
        "Public Solana RPC faucet is closed.",
        "Set E2E_SOLANA_FUNDER_SECRET to a devnet keypair funded via https://faucet.solana.com",
        "(base58 secret or solana-keygen JSON byte array), then re-run.",
      ].join(" ")
    );
  }

  const connection = getDevnetConnection();
  const funder = parseFunderSecret(secret);
  const to = new PublicKey(address);
  const lamports = Math.round(sol * LAMPORTS_PER_SOL);

  const funderBalance = await connection.getBalance(funder.publicKey);
  if (funderBalance < lamports + 5000) {
    throw new Error(
      `Funder ${funder.publicKey.toBase58()} has ${
        funderBalance / LAMPORTS_PER_SOL
      } SOL; need ~${sol} SOL. Top up at https://faucet.solana.com`
    );
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: funder.publicKey,
      toPubkey: to,
      lamports,
    })
  );

  return sendAndConfirmTransaction(connection, transaction, [funder], {
    commitment: "confirmed",
  });
}

export async function getDevnetSolBalance(address: string): Promise<number> {
  const lamports = await getDevnetConnection().getBalance(
    new PublicKey(address)
  );
  return lamports / LAMPORTS_PER_SOL;
}

export async function waitForDevnetSolBalance(
  address: string,
  minSol: number,
  timeoutMs = 90_000
): Promise<number> {
  const start = Date.now();
  let balance = await getDevnetSolBalance(address);

  while (balance < minSol) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        `Timed out waiting for ${address} balance >= ${minSol} SOL (have ${balance})`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    balance = await getDevnetSolBalance(address);
  }

  return balance;
}
