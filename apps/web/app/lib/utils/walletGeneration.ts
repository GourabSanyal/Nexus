import { WalletPath } from "@repo/constants/src/WalletPaths";
import { generateSolanaWallet } from "@/app/lib/utils/generateSolanaWallet";
import { generateEthWallet } from "@/app/lib/utils/generateEthWallet";

export const generateWallet = async (mnemonic: string, path: string) => {
  switch (path) {
    case WalletPath.SOLANA: {
      const { solPublicKey, solSecretKey } = await generateSolanaWallet({
        mnemonic,
        path,
      });
      return {
        type: "solana" as const,
        publicKey: solPublicKey,
        privateKey: solSecretKey,
      };
    }
    case WalletPath.ETHEREUM: {
      const { ethPublicKey, ethPrivateKey } = await generateEthWallet({
        mnemonic,
        path,
      });
      return {
        type: "ethereum" as const,
        publicKey: ethPublicKey,
        privateKey: ethPrivateKey,
      };
    }
    default:
      throw new Error("Invalid wallet path provided");
  }
};
