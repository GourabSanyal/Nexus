import { WalletActionButton } from "./WalletActionButton";
import { WalletActionsProps } from "@/app/types/wallet/WalletActionTypes";

export const WalletActions = ({
  generateWallet,
  importWallet,
}: WalletActionsProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100dvh-10rem)] sm:min-h-[calc(100dvh-12rem)] px-4 gap-4 sm:gap-5">
      <WalletActionButton actionType="import" onClick={importWallet} />
      <WalletActionButton actionType="generate" onClick={generateWallet} />
    </div>
  );
};
