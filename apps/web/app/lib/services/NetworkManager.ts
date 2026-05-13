import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";

const keyFor = (chain: ChainEnum, walletId?: number) =>
  walletId != null ? `${chain}:${walletId}` : "";

/** Read effective cluster from Recoil-shaped maps (single source of truth). */
export function getEffectiveNetworkFromStores(
  chain: ChainEnum,
  walletId: number | undefined,
  globalNetworks: Record<ChainEnum, NetworkEnum>,
  overrides: Record<string, NetworkEnum>
): NetworkEnum {
  if (walletId != null) {
    const k = keyFor(chain, walletId);
    const o = overrides[k];
    if (o) return o;
  }
  return globalNetworks[chain];
}

type SetGlobals = (
  updater: (prev: Record<ChainEnum, NetworkEnum>) => Record<ChainEnum, NetworkEnum>
) => void;
type SetOverrides = (
  updater: (prev: Record<string, NetworkEnum>) => Record<string, NetworkEnum>
) => void;

/**
 * Mutations for per-chain / per-wallet network selection.
 * Does not hold Recoil snapshots — pass latest maps into {@link getEffectiveNetwork} / {@link toggleNetwork}.
 */
export class NetworkManager {
  private readonly setGlobalNetworks: SetGlobals;
  private readonly setOverrides: SetOverrides;
  private readonly adapter: IWalletAdapter;
  private readonly chain: ChainEnum;
  private readonly walletId?: number;

  constructor(
    adapter: IWalletAdapter,
    chain: ChainEnum,
    walletId: number | undefined,
    setGlobalNetworks: SetGlobals,
    setOverrides: SetOverrides
  ) {
    this.adapter = adapter;
    this.chain = chain;
    this.walletId = walletId;
    this.setGlobalNetworks = setGlobalNetworks;
    this.setOverrides = setOverrides;
  }

  getEffectiveNetwork(
    globalNetworks: Record<ChainEnum, NetworkEnum>,
    overrides: Record<string, NetworkEnum>
  ): NetworkEnum {
    return getEffectiveNetworkFromStores(
      this.chain,
      this.walletId,
      globalNetworks,
      overrides
    );
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

  toggleNetwork(
    globalNetworks: Record<ChainEnum, NetworkEnum>,
    overrides: Record<string, NetworkEnum>
  ): void {
    const current = this.getEffectiveNetwork(globalNetworks, overrides);
    const next = this.adapter.getNextNetwork(current);
    this.setNetwork(next);
  }
}
