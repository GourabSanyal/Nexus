import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../dialog/dialog";
import { Button } from "../../../button/button";
import { LogoutConfirmationModalProps } from "@/app/types/components/LogoutConfirmationModalProps"

const LogoutConfirmationModal = ({
  onConfirm,
  onCancel,
}: LogoutConfirmationModalProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          Confirm Logout
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Are you sure you want to log out? This will clear your wallet data
          from this session.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex justify-end gap-3 mt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="py-2 px-4 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition-colors duration-300"
          onClick={onConfirm}
        >
          Logout
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default LogoutConfirmationModal;
