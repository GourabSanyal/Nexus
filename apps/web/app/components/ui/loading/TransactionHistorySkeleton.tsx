import React from "react";

interface TransactionHistorySkeletonProps {
  count?: number;
}

const TransactionHistorySkeleton: React.FC<TransactionHistorySkeletonProps> = ({
  count = 5,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse border border-border rounded-lg p-4 bg-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-5 bg-muted rounded w-16"></div>
              <div className="h-5 bg-muted rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistorySkeleton;

