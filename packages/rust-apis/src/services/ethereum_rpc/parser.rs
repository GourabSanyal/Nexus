//! Pure Alchemy-transfer JSON → `TransactionInfo` conversions.

use serde_json::Value;

use crate::models::transaction::TransactionInfo;

pub(super) fn map_transaction(t: &Value, address: &str) -> TransactionInfo {
    let from = string_field(t, "from");
    let to = string_field(t, "to");
    TransactionInfo {
        signature: t
            .get("hash")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string(),
        slot: block_num(t),
        block_time: block_time(t),
        status: "success".to_string(),
        err: None,
        confirmation_status: None,
        amount: amount_eth(t),
        fee: None,
        direction: transfer_direction(&from, &to, address),
        from_address: from,
        to_address: to,
        memo: None,
    }
}

pub(super) fn block_num(t: &Value) -> u64 {
    let hex = t
        .get("blockNum")
        .and_then(|v| v.as_str())
        .unwrap_or("0x0")
        .trim_start_matches("0x");
    u64::from_str_radix(hex, 16).unwrap_or(0)
}

fn string_field(t: &Value, key: &str) -> Option<String> {
    t.get(key).and_then(|v| v.as_str()).map(|s| s.to_string())
}

fn transfer_direction(from: &Option<String>, to: &Option<String>, address: &str) -> Option<String> {
    let addr = address.to_lowercase();
    match (
        from.as_ref().map(|x| x.to_lowercase()),
        to.as_ref().map(|x| x.to_lowercase()),
    ) {
        (Some(f), Some(t)) if f == addr && t == addr => Some("self".to_string()),
        (Some(f), _) if f == addr => Some("sent".to_string()),
        (_, Some(t)) if t == addr => Some("received".to_string()),
        _ => Some("received".to_string()),
    }
}

fn block_time(t: &Value) -> Option<i64> {
    let timestamp = t
        .get("metadata")
        .and_then(|m| m.get("blockTimestamp"))
        .and_then(|v| v.as_str())?;
    let millis = js_sys::Date::new(&wasm_bindgen::JsValue::from_str(timestamp)).get_time();
    if !millis.is_finite() {
        return None;
    }
    Some((millis / 1000.0) as i64)
}

fn amount_eth(t: &Value) -> Option<f64> {
    if let Some(amount) = amount_from_value_field(t.get("value")) {
        return Some(amount);
    }
    amount_from_raw_contract(t.get("rawContract"))
}

fn amount_from_value_field(value: Option<&Value>) -> Option<f64> {
    let value = value?;
    if let Some(n) = value.as_f64() {
        return Some(n);
    }
    value.as_str().and_then(|s| s.parse::<f64>().ok())
}

fn amount_from_raw_contract(raw_contract: Option<&Value>) -> Option<f64> {
    let hex_wei = raw_contract?
        .get("value")
        .and_then(|v| v.as_str())?
        .trim_start_matches("0x");
    let wei = u128::from_str_radix(hex_wei, 16).ok()?;
    Some((wei as f64) / 1_000_000_000_000_000_000_f64)
}
