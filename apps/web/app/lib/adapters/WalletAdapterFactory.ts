import { IWalletAdapter } from "./IWalletAdapter";
import { SolanaWalletAdapter } from "./SolanaWalletAdapter";
import { EthereumWalletAdapter } from "./EthereumWalletAdapter";

export class WalletAdapterFactory {
  static create(walletType: 'solana' | 'ethereum'): IWalletAdapter {
    switch (walletType) {
      case 'solana':
        return new SolanaWalletAdapter();
      case 'ethereum':
        return new EthereumWalletAdapter();
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  }
}

