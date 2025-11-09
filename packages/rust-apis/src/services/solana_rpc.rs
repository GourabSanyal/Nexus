use anyhow::Result;
use solana_client::{
    nonblocking::rpc_client::RpcClient,
    rpc_client::GetConfirmedSignaturesForAddress2Config,
    rpc_config::RpcTransactionConfig,
    rpc_response::RpcConfirmedTransactionStatusWithSignature,
};
use solana_commitment_config::CommitmentConfig;
use solana_sdk::{
    pubkey::Pubkey,
    signature::Signature,
};
use std::str::FromStr;
use crate::models::TransactionInfo;

pub async fn get_balance(address: &str, cluster_url: &str) -> Result<u64> {
    let client = RpcClient::new_with_commitment(
        cluster_url.to_string(),
        CommitmentConfig::confirmed(),
    );

    let pubkey = Pubkey::from_str(address)?;
    let balance = client.get_balance(&pubkey).await?;

    Ok(balance)
}

pub async fn get_transactions(
    address: &str,
    cluster_url: &str,
    limit: Option<usize>,
) -> Result<(Vec<TransactionInfo>, bool, Option<String>)> {
    if address.is_empty() {
        return Err(anyhow::anyhow!("Address cannot be empty"));
    }
    if cluster_url.is_empty() {
        return Err(anyhow::anyhow!("Cluster URL cannot be empty"));
    }

    let client = RpcClient::new_with_commitment(
        cluster_url.to_string(),
        CommitmentConfig::confirmed(),
    );

    let pubkey = Pubkey::from_str(address)
        .map_err(|e| anyhow::anyhow!("Invalid Solana address format: {}", e))?;
    
    let effective_limit = limit.unwrap_or(20).min(100); // Default 20, max 100
    let signatures_config = GetConfirmedSignaturesForAddress2Config {
        before: None,
        until: None,
        limit: Some(effective_limit + 1), 
        commitment: Some(CommitmentConfig::finalized()),
    };

    let signatures = client
        .get_signatures_for_address_with_config(&pubkey, signatures_config)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to fetch signatures: {}", e))?;

    let has_more = signatures.len() > effective_limit;
    let signatures_to_process = if has_more {
        &signatures[..effective_limit]
    } else {
        &signatures
    };

    let next_cursor = if has_more && !signatures.is_empty() {
        signatures_to_process.last().map(|s| s.signature.clone())
    } else {
        None
    };

    let mut transactions = Vec::new();

    for sig_info in signatures_to_process {
        let signature = match Signature::from_str(&sig_info.signature) {
            Ok(sig) => sig,
            Err(e) => {
                eprintln!("Invalid signature format {}: {}", sig_info.signature, e);
                transactions.push(create_transaction_info_from_signature(sig_info, &pubkey));
                continue;
            }
        };
        
        let tx_config = RpcTransactionConfig {
            encoding: Some(solana_transaction_status::UiTransactionEncoding::Json),
            commitment: Some(CommitmentConfig::finalized()),
            max_supported_transaction_version: Some(0),
        };

        match client.get_transaction_with_config(&signature, tx_config).await {
            Ok(tx_with_meta) => {
                let tx_info = extract_transaction_info(&tx_with_meta, sig_info, &pubkey);
                transactions.push(tx_info);
            }
            Err(e) => {
                eprintln!("Warning: Failed to fetch transaction details for {}: {}", sig_info.signature, e);
                transactions.push(create_transaction_info_from_signature(sig_info, &pubkey));
            }
        }
    }

    Ok((transactions, has_more, next_cursor))
}

fn create_transaction_info_from_signature(
    sig_info: &RpcConfirmedTransactionStatusWithSignature,
    _target_pubkey: &Pubkey,
) -> TransactionInfo {
    let status = if sig_info.err.is_some() {
        "failed".to_string()
    } else {
        "success".to_string()
    };

    TransactionInfo {
        signature: sig_info.signature.clone(),
        slot: sig_info.slot,
        block_time: sig_info.block_time,
        status,
        err: sig_info.err.as_ref().map(|e| serde_json::to_value(e).unwrap_or(serde_json::Value::Null)),
        confirmation_status: sig_info.confirmation_status.as_ref().map(|s| format!("{:?}", s)),
        amount: None,
        fee: None,
        direction: None,
        from_address: None,
        to_address: None,
        memo: sig_info.memo.clone(),
    }
}

fn extract_transaction_info(
    tx_with_meta: &solana_transaction_status::EncodedConfirmedTransactionWithStatusMeta,
    sig_info: &RpcConfirmedTransactionStatusWithSignature,
    target_pubkey: &Pubkey,
) -> TransactionInfo {
    let meta = tx_with_meta.transaction.meta.as_ref();
    
    let status = if meta.map(|m| m.err.is_some()).unwrap_or(false) || sig_info.err.is_some() {
        "failed".to_string()
    } else {
        "success".to_string()
    };

    let (amount, direction, from_address, to_address) = calculate_transaction_details(tx_with_meta, target_pubkey);
    
    let fee = meta.map(|m| m.fee);

    TransactionInfo {
        signature: sig_info.signature.clone(),
        slot: tx_with_meta.slot,
        block_time: tx_with_meta.block_time.or(sig_info.block_time),
        status,
        err: sig_info.err.as_ref().or_else(|| meta.and_then(|m| m.err.as_ref()))
            .map(|e| serde_json::to_value(e).unwrap_or(serde_json::Value::Null)),
        confirmation_status: sig_info.confirmation_status.as_ref().map(|s| format!("{:?}", s)),
        amount,
        fee,
        direction,
        from_address,
        to_address,
        memo: sig_info.memo.clone(),
    }
}

fn calculate_transaction_details(
    tx_with_meta: &solana_transaction_status::EncodedConfirmedTransactionWithStatusMeta,
    target_pubkey: &Pubkey,
) -> (Option<i64>, Option<String>, Option<String>, Option<String>) {
    let meta = match tx_with_meta.transaction.meta.as_ref() {
        Some(m) => m,
        None => return (None, None, None, None),
    };

    let account_index = match &tx_with_meta.transaction.transaction {
        solana_transaction_status::EncodedTransaction::Json(json_tx) => {
            match &json_tx.message {
                solana_transaction_status::UiMessage::Parsed(parsed_msg) => {
                    parsed_msg.account_keys
                        .iter()
                        .position(|acc| acc.pubkey == target_pubkey.to_string())
                }
                solana_transaction_status::UiMessage::Raw(raw_msg) => {
                    raw_msg.account_keys
                        .iter()
                        .position(|key| key == &target_pubkey.to_string())
                }
            }
        }
        _ => None,
    };

    let account_index = match account_index {
        Some(idx) => idx,
        None => return (None, None, None, None),
    };

    let pre_balances = &meta.pre_balances;
    let post_balances = &meta.post_balances;
    
    if account_index >= pre_balances.len() || account_index >= post_balances.len() {
        return (None, None, None, None);
    }

    let pre_balance = pre_balances[account_index] as i64;
    let post_balance = post_balances[account_index] as i64;
    let amount = Some(post_balance - pre_balance);

    let direction = match amount {
        Some(amt) if amt > 0 => Some("received".to_string()),
        Some(amt) if amt < 0 => Some("sent".to_string()),
        Some(_) => Some("self".to_string()),
        None => None,
    };

    let from_address = None;
    let to_address = None;

    (amount, direction, from_address, to_address)
}
