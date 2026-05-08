import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Wallet, parseEther } from "ethers";
import { rustApiClient } from "@api-utils/rustApiClient";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { validateSendInput } from "@my-org/zod";

interface SendTransactionParams {
  chain: ChainEnum;
  cluster: NetworkEnum;
  from: string;
  privateKey: string;
  to: string;
  amount: string;
}

interface SendTransactionResult {
  id: string;
}

const extractResponseErrorMessage = (responseData: unknown): string | null => {
  if (typeof responseData === "object" && responseData !== null) {
    const apiError = (responseData as { error?: unknown }).error;
    if (typeof apiError === "string" && apiError.trim().length > 0) {
      return apiError;
    }
  }
  return null;
};

const extractApiErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = (error as { response?: { data?: { error?: unknown } } })
      .response;
    const apiError = maybeResponse?.data?.error;
    if (typeof apiError === "string" && apiError.trim().length > 0) {
      return apiError;
    }

    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "Failed to send transaction";
};

const decimalToAtomicUnits = (amount: string, decimals: number): bigint => {
  const normalized = amount.trim();

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw new Error("Amount must be a positive decimal number");
  }

  const [whole = "0", fraction = ""] = normalized.split(".");

  if (fraction.length > decimals) {
    throw new Error(`Amount supports up to ${decimals} decimal places`);
  }

  return (
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, "0") || "0")
  );
};

const sendEthereumTransaction = async ({
  cluster,
  from,
  privateKey,
  to,
  amount,
}: Omit<SendTransactionParams, "chain">): Promise<SendTransactionResult> => {
  const client = rustApiClient();
  const value = parseEther(amount);
  const valueHex = `0x${value.toString(16)}`;

  const prepareResponse = await client.post("/wallet/ethereum/send/prepare", {
    address: from,
    cluster,
    to,
    value: valueHex,
  });

  const prepared = prepareResponse.data;
  const wallet = new Wallet(privateKey);
  const signedTransaction = await wallet.signTransaction({
    to,
    value,
    chainId: Number(BigInt(prepared.chainId)),
    nonce: Number(BigInt(prepared.nonce)),
    gasPrice: BigInt(prepared.gasPrice),
    gasLimit: BigInt(prepared.gasLimit),
  });

  try {
    const response = await client.post("/wallet/ethereum/send", {
      address: from,
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

const sendSolanaTransaction = async ({
  cluster,
  from,
  privateKey,
  to,
  amount,
}: Omit<SendTransactionParams, "chain">): Promise<SendTransactionResult> => {
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

export const sendTransaction = async (
  params: SendTransactionParams
): Promise<SendTransactionResult> => {
  const validationResult = validateSendInput({
    chain: params.chain,
    recipient: params.to,
    amount: params.amount,
  });

  if (!validationResult.success) {
    const firstError =
      validationResult.error.flatten().fieldErrors.recipient?.[0] ||
      validationResult.error.flatten().fieldErrors.amount?.[0] ||
      "Invalid send transaction input";

    throw new Error(firstError);
  }

  if (params.chain === ChainEnum.Ethereum) {
    return sendEthereumTransaction(params);
  }

  if (params.chain === ChainEnum.Solana) {
    return sendSolanaTransaction(params);
  }

  throw new Error("Unsupported chain");
};
