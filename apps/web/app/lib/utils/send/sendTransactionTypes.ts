import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";

/** Full send payload including chain (used by `sendTransaction` util). */
export type WalletSendParams = {
  chain: ChainEnum;
  cluster: NetworkEnum;
  from: string;
  privateKey: string;
  to: string;
  amount: string;
};

export type WalletSendResult = { id: string };

/** Adapter-facing send args (`chain` is implied by the adapter implementation). */
export type AdapterWalletSendParams = Omit<WalletSendParams, "chain">;
