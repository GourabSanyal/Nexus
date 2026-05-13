import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { ChainEnum, NetworkEnum } from "@my-org/store";
import { walletState } from "@my-org/store";
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";
import { useNetworkManager } from "@/app/hooks/useNetworkManager";
import { useWalletBalances } from "@my-org/store";

interface UseSendModalProps {
  walletId: number;
  chain: ChainEnum.Solana | ChainEnum.Ethereum;
}

export const useSendModal = ({ walletId, chain }: UseSendModalProps): {
  wallet: any;
  currentNetwork: NetworkEnum;
  balance: string | bigint;
  handleNetworkToggle: () => void;
  chainEnum: ChainEnum;
} => {
  const walletStateValue = useRecoilValue(walletState);
  const { getBalance } = useWalletBalances();

  const wallet = [
    ...(walletStateValue.solanaWallets || []),
    ...(walletStateValue.ethereumWallets || []),
  ].find((w) => w.id === walletId);

  // Memoize adapter to prevent recreation on every render
  // not memoizing cause infinite loop
  const adapter = useMemo(() => {
    return wallet ? WalletAdapterFactory.create(wallet.type) : null;
  }, [wallet?.type]);

  const chainEnum: ChainEnum = adapter?.chain || chain;

  const networkManager = useNetworkManager(adapter, chainEnum, walletId);

  // Using networkManager.currentNetwork makes sure modals stays in sync with header toggle
  const currentNetwork =
    networkManager.currentNetwork ||
    adapter?.getDefaultNetwork() ||
    NetworkEnum.Mainnet;

  const balance = useMemo(() => {
    if (!wallet) return "0";
    return getBalance(wallet.id, wallet.type, currentNetwork);
  }, [wallet, currentNetwork, getBalance]);

  const handleNetworkToggle = () => {
    networkManager.toggle();
  };

  return {
    wallet,
    currentNetwork,
    balance,
    handleNetworkToggle,
    chainEnum,
  };
};
