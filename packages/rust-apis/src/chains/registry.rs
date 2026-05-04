use std::collections::HashMap;

use crate::chains::ethereum::EthereumAdapter;
use crate::chains::solana::SolanaAdapter;
use crate::chains::traits::BlockchainAdapter;

pub struct ChainRegistry {
    adapters: HashMap<&'static str, Box<dyn BlockchainAdapter>>,
}

impl ChainRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            adapters: HashMap::new(),
        };
        registry.register(Box::new(SolanaAdapter));
        registry.register(Box::new(EthereumAdapter));
        registry
    }

    pub fn register(&mut self, adapter: Box<dyn BlockchainAdapter>) {
        self.adapters.insert(adapter.chain_name(), adapter);
    }

    pub fn adapter(&self, chain: &str) -> Option<&dyn BlockchainAdapter> {
        self.adapters.get(chain).map(|adapter| adapter.as_ref())
    }
}
