"use client";

import { Button } from "../button/button";
import { Sun, Moon } from "lucide-react";

interface WalletHeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

function WalletHeader({ toggleTheme, isDarkMode }: WalletHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
      <h1 className="text-2xl font-bold mb-4 sm:mb-0">Nexus</h1>
      <Button onClick={toggleTheme} size="icon" className="rounded-full p-2">
        {isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}

export default WalletHeader;
