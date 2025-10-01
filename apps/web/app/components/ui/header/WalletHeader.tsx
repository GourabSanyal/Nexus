"use client";

import { Button } from "../button/button";
import { Sun, Moon } from "lucide-react";

interface WalletHeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

function WalletHeader({ toggleTheme, isDarkMode }: WalletHeaderProps) {
  return (
    <div className="flex flex-row justify-between items-center w-full mb-6 sm:mb-8">
      <h1 className="text-xl sm:text-2xl font-bold">Nexus</h1>
      <Button 
        onClick={toggleTheme} 
        size="icon" 
        className="rounded-full p-2 w-10 h-10 sm:w-12 sm:h-12"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>
    </div>
  );
}

export default WalletHeader;
