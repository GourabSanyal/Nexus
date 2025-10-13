export interface Wallet {
    id: number;
    name: string;
    publicKey: string;
    privateKey: string;
    mnemonic?: string;
    path?: string;
    type: 'solana' | 'ethereum';
  }
