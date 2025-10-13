"use client";

import { Button } from "../../button/button";
import { RotateCw } from "lucide-react";
import { RefreshIconButtonProps } from "@/app/types/wallet/RefreshButtonTypes";

const RefreshButton = ({ onClick, className, isRefreshing }: RefreshIconButtonProps) => {
  return (
    <Button
      aria-label="Refresh"
      title="Refresh"
      variant="ghost"
      size="icon"
      className={`h-7 w-7 text-muted-foreground hover:text-foreground ${className ?? ""}`}
      onClick={onClick}
      disabled={!!isRefreshing}
    >
      <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </Button>
  );
};

export default RefreshButton;


