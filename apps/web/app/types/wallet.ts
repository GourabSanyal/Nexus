interface Wallet {
    id: number;
    name: string;
    publicKey: string;
    privateKey: string;
    mneumonic: string;
    path: string;
    type: 'solana' | 'ethereum';
  }

export type { Wallet }