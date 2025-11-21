"use client";

interface NetworkToggleProps {
  currentNetwork: string | number;
  onToggle: () => void;
  displayName: string;
  colorClass: string;
}

export function NetworkToggle({
  currentNetwork,
  onToggle,
  displayName,
  colorClass,
}: NetworkToggleProps) {
  return (
    <button
      aria-label="Toggle network"
      title={displayName}
      onClick={onToggle}
      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${colorClass}`}
    >
      {displayName}
    </button>
  );
}

