import { ChainEnum } from "@repo/store/src/enums/network";
import { validateSendInput } from "@my-org/zod";
import { sendEthereumTransaction } from "./send/sendEthereumTransaction";
import { sendSolanaTransaction } from "./send/sendSolanaTransaction";
import type {
  AdapterWalletSendParams,
  WalletSendParams,
  WalletSendResult,
} from "./send/sendTransactionTypes";

export type {
  WalletSendParams,
  WalletSendResult,
  AdapterWalletSendParams,
};

export const sendTransaction = async (
  params: WalletSendParams
): Promise<WalletSendResult> => {
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
