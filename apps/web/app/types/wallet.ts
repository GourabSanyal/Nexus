interface Wallet {
    id: number;
    name: string;
    publicKey: string;
    privateKey: string;
    mneumonic: string;
    path: string;
  }

export type { Wallet }