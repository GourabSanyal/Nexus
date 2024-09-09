import { Button } from "../button/button";
import { Plus } from "lucide-react";

interface WalletActionsProps {
  generateWallet: () => void;
}

export const WalletActions = ({ generateWallet }: WalletActionsProps) => {
  return (
    <Button
      onClick={generateWallet}
      className="w-full sm:w-auto mb-6 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300"
    >
      <Plus className="inline-block mr-2 h-5 w-5" /> Generate Wallet
    </Button>
  );
};