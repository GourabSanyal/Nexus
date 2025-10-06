import { useRecoilState } from 'recoil';
import { walletState } from '../atoms/walletState';
import { toast } from 'sonner';
import { WalletPath } from '@/constants/wallet';

export const useWalletOperations = () => {
  const [walletStateValue, setWalletState] = useRecoilState(walletState);

  const deleteWallet = (id: number, type: "solana" | "ethereum") => {
    if (type === "solana") {
      setWalletState(prev => ({
        ...prev,
        solanaWallets: prev.solanaWallets?.filter(wallet => wallet.id !== id) || []
      }));
      toast.success("Solana wallet deleted successfully");
    } else {
      setWalletState(prev => ({
        ...prev,
        ethereumWallets: prev.ethereumWallets?.filter(wallet => wallet.id !== id) || []
      }));
      toast.success("Ethereum wallet deleted successfully");
    }
  };

  const addWallet = (type: "solana" | "ethereum", publicKey: string, privateKey: string) => {
    if (type === "solana") {
      const newWallet = {
        id: Date.now(),
        name: `Solana Wallet ${(walletStateValue.solanaWallets?.length || 0) + 1}`,
        publicKey,
        privateKey,
        type: "solana" as const,
        mnemonic: walletStateValue.mnemonicState,
        path: WalletPath.SOLANA
      };
      
      setWalletState(prev => ({
        ...prev,
        solanaWallets: [...(prev.solanaWallets || []), newWallet]
      }));
      toast.success("New Solana wallet added");
    } else {
      const newWallet = {
        id: Date.now(),
        name: `Ethereum Wallet ${(walletStateValue.ethereumWallets?.length || 0) + 1}`,
        publicKey,
        privateKey,
        type: "ethereum" as const,
        mnemonic: walletStateValue.mnemonicState,
        path: WalletPath.ETHEREUM
      };
      
      setWalletState(prev => ({
        ...prev,
        ethereumWallets: [...(prev.ethereumWallets || []), newWallet]
      }));
      toast.success("New Ethereum wallet added");
    }
  };

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
    deleteWallet,
    addWallet,
    editWalletName,
    walletState: walletStateValue
  };
};
