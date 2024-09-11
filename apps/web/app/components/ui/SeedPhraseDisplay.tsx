"use client"

import React from 'react'
import { Button } from './button/button'
import { Eye, EyeOff } from 'lucide-react'

interface SeedPhraseDisplayProps {
    seedPhrase: string;
    showSeedPhrase: boolean;
    setShowSeedPhrase: (show: boolean) => void;
    copyToClipboard: (text: string, label: string) => void;
  }

const SeedPhraseDisplay = ({seedPhrase, showSeedPhrase, setShowSeedPhrase, copyToClipboard}: SeedPhraseDisplayProps) => {
  return (
    <div className="mb-4 p-4 bg-muted rounded-md">
    <div className="flex justify-between items-center mb-2">
      <span className="font-semibold">Seed Phrase:</span>
      <Button
        variant="ghost"
        // size="sm"
        onClick={() => setShowSeedPhrase(!showSeedPhrase)}
      >
        {showSeedPhrase ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
    <div
      className="text-sm cursor-pointer"
      onClick={() => copyToClipboard(seedPhrase, "seed phrase")}
    >
      {showSeedPhrase ? seedPhrase : '••••• ••••• ••••• •••••'}
    </div>
  </div>
  )
}

export default SeedPhraseDisplay