//! Chain-agnostic parsing helpers shared across RPC services.

use anyhow::{anyhow, Result};
use serde_json::Value;

/// Extract `Value` as `String`, or `Err("Failed to parse {label}")`.
pub fn value_as_string(value: &Value, label: &str) -> Result<String> {
    value
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow!("Failed to parse {label}"))
}
