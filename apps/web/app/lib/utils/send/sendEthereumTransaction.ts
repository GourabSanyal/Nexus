import { Wallet, parseEther } from "ethers";
import { rustApiClient } from "@api-utils/rustApiClient";
import type { AdapterWalletSendParams, WalletSendResult } from "./sendTransactionTypes";
import {
  extractApiErrorMessage,
  extractResponseErrorMessage,
} from "./sendTransactionErrors";

export const sendEthereumTransaction = async ({
  cluster,
  from,
  privateKey,
  to,
  amount,
}: AdapterWalletSendParams): Promise<WalletSendResult> => {
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
