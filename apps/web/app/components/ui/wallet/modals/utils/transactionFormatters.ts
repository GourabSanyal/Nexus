const LAMPORTS_PER_SOL = 1_000_000_000;

export const formatAmount = (lamports: number | null): string => {
  if (lamports === null) return "0";
  const sol = Math.abs(lamports) / LAMPORTS_PER_SOL;
  return sol.toFixed(4);
};

export const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return "Unknown";
  return new Date(timestamp * 1000).toLocaleString();
};

export const truncateSignature = (signature: string, length: number = 8): string => {
  if (signature.length <= length * 2) return signature;
  return `${signature.slice(0, length)}...${signature.slice(-length)}`;
};

