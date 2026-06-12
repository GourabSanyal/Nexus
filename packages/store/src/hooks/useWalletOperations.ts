import { useRecoilState } from 'recoil';
import { walletState } from '../atoms/walletState';
import { toast } from 'sonner';

export const useWalletOperations = () => {
  const [walletStateValue, setWalletState] = useRecoilState(walletState);

  const editWalletName = (id: number, newName: string, type: "solana" | "ethereum") => {
    if (type === "solana") {
      setWalletState(prev => ({
        ...prev,
        solanaWallets: prev.solanaWallets?.map(wallet => 
          wallet.id === id ? { ...wallet, name: newName } : wallet
        ) || []
      }));
      toast.success("Solana wallet name updated successfully");
    } else {
      setWalletState(prev => ({
        ...prev,
        ethereumWallets: prev.ethereumWallets?.map(wallet => 
          wallet.id === id ? { ...wallet, name: newName } : wallet
        ) || []
      }));
      toast.success("Ethereum wallet name updated successfully");
    }
  };

  return {
    editWalletName,
    walletState: walletStateValue
  };
};
