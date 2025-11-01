use anyhow::Result;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_commitment_config::CommitmentConfig;
use solana_sdk::{native_token::LAMPORTS_PER_SOL, pubkey::Pubkey};
use std::str::FromStr;

#[tokio::main]
async fn get_balance(address: &str, cluster_url:&str) -> Result<u64> {
    let client = RpcClient::new_with_commitment(
        cluster_url.to_string(),
        CommitmentConfig::confirmed(),
    );

    let pubkey = Pubkey::from_str(address)?;
    let balance = client.get_balance(&pubkey).await?;

    println!("{:#?} SOL", balance / LAMPORTS_PER_SOL);

    Ok(())
}