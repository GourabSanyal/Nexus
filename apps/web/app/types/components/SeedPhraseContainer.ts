export interface SeedPhraseContainerPropTypes {
  activeTab: "solana" | "ethereum";
  setActiveTab: (tab: "solana" | "ethereum") => void;
  onImportMore?: () => void;
}