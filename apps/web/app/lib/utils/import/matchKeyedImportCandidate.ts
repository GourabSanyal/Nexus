import type { FlatImportWalletEntry } from "@my-org/zod";
import type { KeyedImportCandidate } from "./deriveImportCandidates";

export const matchKeyedImportCandidate = (
  entry: Pick<FlatImportWalletEntry, "chain" | "address" | "derivationPath">,
  keyed: KeyedImportCandidate[]
): KeyedImportCandidate | undefined =>
  keyed.find(
    (candidate) =>
      candidate.chain === entry.chain &&
      candidate.address === entry.address &&
      candidate.derivationPath === entry.derivationPath
  );
