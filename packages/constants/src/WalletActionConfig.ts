import { Plus, Import } from "lucide-react";

export interface ButtonConfig {
  text: string;
  icon: typeof Plus | typeof Import;
  bgColor: string;
  textColor: string;
  hoverColor: string;
  borderColor: string;
}

export const WALLET_ACTION_CONFIG: Record<string, ButtonConfig> = {
  generate: {
    text: "Generate Wallet",
    icon: Plus,
    bgColor: "bg-primary",
    textColor: "text-primary-foreground",
    hoverColor: "hover:bg-primary/90",
    borderColor: "border-primary/20",
  },
  import: {
    text: "Import Wallet",
    icon: Import,
    bgColor: "bg-secondary",
    textColor: "text-secondary-foreground",
    hoverColor: "hover:bg-secondary/90",
    borderColor: "border-secondary/20",
  },
};
