"use client";

import { Button } from "../../../button/button";
import { RotateCw, MoreVertical } from "lucide-react";
import { useState } from "react";
import { SmallScreenMenuProps } from "@/app/types/wallet/SmallScreenMenuTypes";

export function SmallScreenMenu({ wallet, onRefresh, onEditName, onDelete }: SmallScreenMenuProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  return (
    <div className="relative sm:hidden">
      <Button
        aria-label="More actions"
        title="More actions"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border bg-popover text-popover-foreground shadow-md p-1 z-50">
          <button
            className="w-full text-left px-3 py-2 rounded-sm hover:bg-muted text-sm flex items-center"
            onClick={() => {
              onRefresh();
              setMenuOpen(false);
            }}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            className="w-full text-left px-3 py-2 rounded-sm hover:bg-muted text-sm flex items-center"
            onClick={() => {
              const newName = prompt("Enter new wallet name:", wallet.name);
              if (newName) onEditName(newName);
              setMenuOpen(false);
            }}
          >
            <svg
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Rename
          </button>
          <button
            className="w-full text-left px-3 py-2 rounded-sm text-destructive hover:bg-destructive/10 text-sm flex items-center"
            onClick={() => {
              onDelete();
              setMenuOpen(false);
            }}
          >
            <svg
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
