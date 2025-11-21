import { NetworkEnum } from "@repo/store/src/enums/network";

export interface NetworkToggleContextValueProps {
  currentNetwork: NetworkEnum;
  availableNetworks: NetworkEnum[];
  toggle: () => void;
  setNetwork: (network: NetworkEnum) => void;
  getDisplayName: (network: NetworkEnum) => string;
  getNetworkColor: (network: NetworkEnum) => string;
}
