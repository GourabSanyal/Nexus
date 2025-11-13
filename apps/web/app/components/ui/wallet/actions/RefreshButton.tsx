"use client";

import { Button } from "../../button/button";
import { RotateCw } from "lucide-react";
import { RefreshButtonProps } from "@/app/types/wallet/RefreshButtonTypes";

const RefreshButton = ({ onClick, className, isRefreshing }: RefreshButtonProps) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <Button
      aria-label="Refresh"
      title="Refresh"
      variant="ghost"
      size="icon"
      className={`h-7 w-7 text-muted-foreground hover:text-foreground ${className ?? ""}`}
      onClick={handleClick}
      disabled={!!isRefreshing}
    >
      <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </Button>
  );
};

export default RefreshButton;


