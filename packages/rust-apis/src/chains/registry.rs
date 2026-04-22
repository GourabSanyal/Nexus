use crate::chains::solana::SolanaAdapter;
use crate::chains::traits::BlockchainAdapter;

pub struct ChainRegistry {
    solana: SolanaAdapter,
}

impl ChainRegistry {
    pub fn new() -> Self {
        Self {
            solana: SolanaAdapter,
        }
    }

    pub fn adapter(&self, chain: &str) -> Option<&dyn BlockchainAdapter> {
        match chain {
            "solana" => Some(&self.solana),
            _ => None,
        }
    }
}
