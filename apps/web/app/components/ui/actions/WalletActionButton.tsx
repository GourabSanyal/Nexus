import { Button } from "../button/button";
import { WalletActionButtonProps } from "@/app/types/wallet/WalletActionTypes";
import { WALLET_ACTION_CONFIG } from "@repo/constants/src/WalletActionConfig";

export const WalletActionButton = ({
  actionType,
  onClick,
  className = "",
}: WalletActionButtonProps) => {
  const config = WALLET_ACTION_CONFIG[actionType] || WALLET_ACTION_CONFIG.generate;
  const IconComponent = config!.icon;

  return (
    <Button
      onClick={onClick}
      className={`w-full sm:w-[28vw] min-w-[20vw] py-2 sm:py-3 px-4 sm:px-6 ${config!.bgColor} ${config!.textColor} text-sm sm:text-base font-semibold rounded-lg ${config!.hoverColor} transition-all duration-300 shadow-md hover:shadow-lg border ${config!.borderColor} ${className}`}
    >
      <IconComponent className="inline-block mr-2 h-4 w-4 sm:h-5 sm:w-5" />
      {config!.text}
    </Button>
  );
};
