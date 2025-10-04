export interface SeedPhraseContainerPropTypes {
    mnemonic: string;
    activeTab: "solana" | "ethereum";
    setActiveTab: (tab: "solana" | "ethereum") => void;
  }