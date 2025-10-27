import React from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../dialog/dialog";
import { Button } from "../../../button/button";

type WarningModalProps = {
  onClick: () => void;
};

const WarningModal = ({ onClick }: WarningModalProps) => {
  const openPasswordCoursal = () => {
    onClick();
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">Warning</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Sharing your private key with anyone might risk your funds. Are you
          sure you want to view it?
        </DialogDescription>
      </DialogHeader>
      <div className="flex justify-end">
        <Button
          onClick={openPasswordCoursal}
          className="py-2 px-4 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition-colors duration-300"
        >
          View Private Key
        </Button>
      </div>
    </DialogContent>
  );
};

export default WarningModal;
