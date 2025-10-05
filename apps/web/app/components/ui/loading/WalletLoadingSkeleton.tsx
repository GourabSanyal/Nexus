import React from 'react';

interface WalletLoadingSkeletonProps {
  className?: string;
  showHeader?: boolean;
  showContent?: boolean;
}

const WalletLoadingSkeleton: React.FC<WalletLoadingSkeletonProps> = ({ 
  className = "",
  showHeader = true,
  showContent = true 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showHeader && (
        <div className="h-8 bg-muted rounded mb-4"></div>
      )}
      {showContent && (
        <div className="h-32 bg-muted rounded"></div>
      )}
    </div>
  );
};

export default WalletLoadingSkeleton;
