"use client";

import { Button } from "../../button/button";
import { Clock } from "lucide-react";

interface HistoryButtonProps {
  onClick: () => void;
}

const HistoryButton = ({ onClick }: HistoryButtonProps) => {
  return (
    <Button onClick={onClick} variant="ghost" className="w-full sm:w-auto">
      <Clock className="inline-block mr-2 h-4 w-4" /> History
    </Button>
  );
};

export default HistoryButton;


