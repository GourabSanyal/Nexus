import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Wallet, parseEther } from "ethers";
import { expressApiClient } from "@api-utils/expressApiClient";
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
  const client = expressApiClient();
  const value = parseEther(amount);
  const valueHex = `0x${value.toString(16)}`;

  const prepareResponse = await client.post("/wallet/ethereum/sendeth/prepare", {
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

  const response = await client.post("/wallet/ethereum/sendeth", {
    address: from,
    cluster,
    signedTransaction,
  });

  return { id: response.data.hash };
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
  const response = await client.post("/wallet/solana/send", {
    cluster,
    signedTransaction,
  });

  return { id: response.data.signature };
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
