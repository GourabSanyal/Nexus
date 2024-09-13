import React from 'react'
import { Wallet } from '@/app/types/wallet'
import { SingleWallet } from './SingleWallet';

interface SolanaWalletProps {
    mneumonic: string
}

const SolanaWallet = ({ mneumonic} : SolanaWalletProps) => {
  return (    
    <div>SolanaWallet

    <div className="div">
    <SingleWallet mneumonic={mneumonic} />
    </div>
    </div>
  )
}

export default SolanaWallet