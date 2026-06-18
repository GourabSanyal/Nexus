/**
 * Resolve the Access-Control-Allow-Origin value for a request.
 *
 * `CORS_ORIGIN` is a comma-separated allowlist (same convention as packages/api).
 * When the request `Origin` matches an entry, that origin is echoed back.
 * When `CORS_ORIGIN` is unset, `*` is used for local/non-browser callers.
 */
export function resolveCorsOrigin(
  requestOrigin: string | null,
  corsOriginEnv?: string
): string {
  const allowed =
    corsOriginEnv
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  if (allowed.length === 0) {
    return "*";
  }

  if (requestOrigin && allowed.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Browser requests from a disallowed origin will still fail CORS because this
  // value will not match the request Origin header.
  return allowed[0]!;
}
