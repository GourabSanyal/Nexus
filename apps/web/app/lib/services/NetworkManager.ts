import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";

const keyFor = (chain: ChainEnum, walletId?: number) =>
  walletId != null ? `${chain}:${walletId}` : "";

export class NetworkManager {
  private globalNetworks: Record<ChainEnum, NetworkEnum>;
  private overrides: Record<string, NetworkEnum>;
  private setGlobalNetworks: (updater: (prev: Record<ChainEnum, NetworkEnum>) => Record<ChainEnum, NetworkEnum>) => void;
  private setOverrides: (updater: (prev: Record<string, NetworkEnum>) => Record<string, NetworkEnum>) => void;
  private adapter: IWalletAdapter;
  private chain: ChainEnum;
  private walletId?: number;

  constructor(
    adapter: IWalletAdapter,
    chain: ChainEnum,
    walletId: number | undefined,
    globalNetworks: Record<ChainEnum, NetworkEnum>,
    overrides: Record<string, NetworkEnum>,
    setGlobalNetworks: (updater: (prev: Record<ChainEnum, NetworkEnum>) => Record<ChainEnum, NetworkEnum>) => void,
    setOverrides: (updater: (prev: Record<string, NetworkEnum>) => Record<string, NetworkEnum>) => void
  ) {
    this.adapter = adapter;
    this.chain = chain;
    this.walletId = walletId;
    this.globalNetworks = globalNetworks;
    this.overrides = overrides;
    this.setGlobalNetworks = setGlobalNetworks;
    this.setOverrides = setOverrides;
  }

  getEffectiveNetwork(): NetworkEnum {
    if (this.walletId != null) {
      const k = keyFor(this.chain, this.walletId);
      const o = this.overrides[k];
      if (o) return o;
    }
    return this.globalNetworks[this.chain];
  }

  setNetwork(network: NetworkEnum): void {
    if (!this.adapter.validateNetwork(network)) {
      throw new Error(`Invalid network ${network} for chain ${this.chain}`);
    }

    if (this.walletId != null) {
      const k = keyFor(this.chain, this.walletId);
      this.setOverrides((prev) => ({ ...prev, [k]: network }));
    } else {
      this.setGlobalNetworks((prev) => ({ ...prev, [this.chain]: network }));
    }
  }

  toggleNetwork(): void {
    const current = this.getEffectiveNetwork();
    const next = this.adapter.getNextNetwork(current);
    this.setNetwork(next);
  }
}

