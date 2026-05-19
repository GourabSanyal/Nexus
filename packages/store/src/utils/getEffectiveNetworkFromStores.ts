import { ChainEnum, NetworkEnum } from "../enums/network";

/** Recoil override key: `${chain}:${walletId}` */
export const networkKeyFor = (chain: ChainEnum, walletId?: number): string =>
  walletId != null ? `${chain}:${walletId}` : "";

/** Read effective cluster from Recoil-shaped maps (single source of truth). */
export function getEffectiveNetworkFromStores(
  chain: ChainEnum,
  walletId: number | undefined,
  globalNetworks: Record<ChainEnum, NetworkEnum>,
  overrides: Record<string, NetworkEnum>
): NetworkEnum {
  if (walletId != null) {
    const k = networkKeyFor(chain, walletId);
    const o = overrides[k];
    if (o) return o;
  }
  return globalNetworks[chain];
}
