import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import {
  ChainEnum,
  NetworkEnum,
  selectWalletById,
  useWalletBalances,
  walletState,
} from "@my-org/store";
import { useNetworkManager } from "@/app/hooks/useNetworkManager";
import { useWalletAdapter } from "@/app/lib/adapters/useWalletAdapter";
import type { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";

type WalletFromStore = NonNullable<ReturnType<typeof selectWalletById>>;

interface UseSendModalProps {
  walletId: number;
}

export const useSendModal = ({ walletId }: UseSendModalProps): {
  wallet: WalletFromStore | undefined;
  adapter: IWalletAdapter | null;
  currentNetwork: NetworkEnum;
  balance: string | bigint;
  handleNetworkToggle: () => void;
  chainEnum: ChainEnum;
} => {
  const walletStateValue = useRecoilValue(walletState);
  const { getBalance } = useWalletBalances();

  const wallet = selectWalletById(walletStateValue, walletId);
  const adapter = useWalletAdapter(wallet?.type);
  const chainEnum: ChainEnum = adapter?.chain ?? ChainEnum.Solana;

  const networkManager = useNetworkManager(adapter, chainEnum, walletId);

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
    adapter,
    currentNetwork,
    balance,
    handleNetworkToggle,
    chainEnum,
  };
};
