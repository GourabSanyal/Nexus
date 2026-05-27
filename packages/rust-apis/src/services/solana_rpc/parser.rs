//! Pure JSON → `TransactionInfo` conversions for signature-list items.

use serde_json::Value;

use crate::models::transaction::TransactionInfo;

/// Skeleton from one `getSignaturesForAddress` item; amount/fee/direction filled later in `details`.
pub(super) fn parse_transaction_from_signature(sig_info: &Value) -> TransactionInfo {
    let signature = sig_info
        .get("signature")
        .and_then(|s| s.as_str())
        .unwrap_or("unknown")
        .to_string();

    let slot = sig_info.get("slot").and_then(|s| s.as_u64()).unwrap_or(0);
    let block_time = sig_info.get("blockTime").and_then(|b| b.as_i64());
    let confirmation_status = sig_info
        .get("confirmationStatus")
        .and_then(|c| c.as_str())
        .map(|s| s.to_string());

    TransactionInfo {
        signature,
        slot,
        block_time,
        status: signature_status(sig_info).to_string(),
        err: sig_info.get("err").cloned(),
        confirmation_status,
        amount: None,
        fee: None,
        direction: None,
        from_address: None,
        to_address: None,
        memo: sig_info
            .get("memo")
            .and_then(|m| m.as_str())
            .map(|s| s.to_string()),
    }
}

pub(super) fn signature_from_signature_item(sig_info: &Value) -> Option<String> {
    sig_info
        .get("signature")
        .and_then(|s| s.as_str())
        .map(|s| s.to_string())
}

fn signature_status(sig_info: &Value) -> &'static str {
    if sig_info.get("err").map(|e| !e.is_null()).unwrap_or(false) {
        "failed"
    } else {
        "success"
    }
}
