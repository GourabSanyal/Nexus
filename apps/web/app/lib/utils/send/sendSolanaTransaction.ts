import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { rustApiClient } from "@api-utils/rustApiClient";
import type { AdapterWalletSendParams, WalletSendResult } from "./sendTransactionTypes";
import {
  extractApiErrorMessage,
  extractResponseErrorMessage,
} from "./sendTransactionErrors";
import { decimalToAtomicUnits } from "./sendAmountUtils";

export const sendSolanaTransaction = async ({
  cluster,
  from,
  privateKey,
  to,
  amount,
}: AdapterWalletSendParams): Promise<WalletSendResult> => {
  const client = rustApiClient();
  const lamports = decimalToAtomicUnits(amount, 9);
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(Buffer.from(privateKey, "base64"))
  );
  const fromPublicKey = new PublicKey(from);

  if (!keypair.publicKey.equals(fromPublicKey)) {
    throw new Error("Private key does not match the selected wallet");
  }

  const prepareResponse = await client.post("/wallet/solana/send/prepare", {
    cluster,
  });

  const { blockhash } = prepareResponse.data;
  const transaction = new Transaction({
    feePayer: fromPublicKey,
    recentBlockhash: blockhash,
  }).add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: new PublicKey(to),
      lamports,
    })
  );

  transaction.sign(keypair);

  const signedTransaction = transaction.serialize().toString("base64");
  try {
    const response = await client.post("/wallet/solana/send", {
      cluster,
      signedTransaction,
    });

    if (!response.data?.signature) {
      throw new Error(
        extractResponseErrorMessage(response.data) || "Failed to send transaction"
      );
    }

    return { id: response.data.signature };
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};
