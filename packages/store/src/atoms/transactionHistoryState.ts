import { atom } from "recoil";
import { persistAtom } from "../persistence/recoilPersistConfig";
import { TransactionInfo } from "@repo/api/src/types/TransactionTypes";

// structure: Record<walletId, Record<cluster, TransactionInfo[]>>
// Example: { "1": { "mainnet": [...], "devnet": [...] } }
export const transactionHistoryState = atom<
  Record<string, Record<string, TransactionInfo[]>>
>({
  key: "transactionHistoryState",
  default: {},
  effects_UNSTABLE: [persistAtom],
});

// this is oading states per wallet+cluster
// structure: is like this Record<walletId:cluster, boolean>
export const transactionHistoryLoadingState = atom<Record<string, boolean>>({
  key: "transactionHistoryLoadingState",
  default: {},
});

