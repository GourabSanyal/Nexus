import { WalletActionButton } from "./WalletActionButton";
import { WalletActionsProps } from "@/app/types/wallet/WalletActionTypes";

export const WalletActions = ({
  generateWallet,
  importWallet,
}: WalletActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center w-full gap-4 sm:gap-6 mb-6 sm:mb-8">
      <WalletActionButton actionType="generate" onClick={generateWallet} />
      <WalletActionButton actionType="import" onClick={importWallet} />
    </div>
  );
};
