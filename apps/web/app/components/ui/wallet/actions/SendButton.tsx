"use client";

import { Button } from "../../button/button";
import { Upload } from "lucide-react";

interface SendButtonProps {
  onClick: () => void;
}

const SendButton = ({ onClick }: SendButtonProps) => {
  return (
    <Button onClick={onClick} className="w-full sm:w-auto">
      <Upload className="inline-block mr-2 h-4 w-4" /> Send
    </Button>
  );
};

export default SendButton;


