import { WalletActionButton } from "./WalletActionButton";
import { WalletActionsProps } from "@/app/types/wallet/WalletActionTypes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";

export const WalletActions = ({ generateWallet, importWallet }: WalletActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center w-full gap-4 sm:gap-6 mb-6 sm:mb-8">
      <WalletActionButton actionType="generate" onClick={generateWallet} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-not-allowed">
              <WalletActionButton actionType="import" onClick={importWallet} className="pointer-events-none" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Coming soon...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};