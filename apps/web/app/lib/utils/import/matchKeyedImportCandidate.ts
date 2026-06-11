import type { FlatImportWalletEntry } from "@my-org/zod";
import type { KeyedImportCandidate } from "./deriveImportCandidates";
import { importAddressesMatch } from "./importAddressMatch";

export const matchKeyedImportCandidate = (
  entry: Pick<FlatImportWalletEntry, "chain" | "address" | "derivationPath">,
  keyed: KeyedImportCandidate[]
): KeyedImportCandidate | undefined =>
  keyed.find(
    (candidate) =>
      candidate.chain === entry.chain &&
      candidate.derivationPath === entry.derivationPath &&
      importAddressesMatch(candidate.address, entry.address, entry.chain)
  );
