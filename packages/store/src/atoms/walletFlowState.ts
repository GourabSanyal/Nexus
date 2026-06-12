import { atom } from "recoil";

export type WalletFlowType = "entry" | "import" | "generate";

export const walletFlowState = atom<WalletFlowType>({
  key: "walletFlowState",
  default: "entry",
});