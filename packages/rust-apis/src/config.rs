pub struct Config;

impl Config {
    pub fn get_solana_rpc_url(cluster: &str) -> String {
        match cluster { 
            "mainnet" => {
                std::env::var("SOLANA_MAINNET_RPC").expect("SOLANA_MAINNET_RPC")
            }
            "devnet" => {
                std::env::var("SOLANA_DEVNET_RPC").expect("SOLANA_DEVNET_RPC")
            }
            _ => {
                std::env::var("SOLANA_DEVNET_RPC").expect("SOLANA_DEVNET_RPC")
            }
        }
    }
}
