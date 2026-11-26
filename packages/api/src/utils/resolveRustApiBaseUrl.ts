/** Browser calls the Next.js same-origin proxy; server/runtime uses RUST_API_URL. */
export const RUST_API_PROXY_PATH = "/api/rust";

const LOCAL_RUST_API_URL = "http://localhost:9000";

export function resolveRustApiBaseUrl(): string {
  // `window` is a browser global. The API tsconfig has no DOM lib, so read it
  // off globalThis instead of naming `window` directly.
  if (typeof (globalThis as { window?: unknown }).window !== "undefined") {
    return RUST_API_PROXY_PATH;
  }

  const serverUrl =
    process.env.RUST_API_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (!serverUrl) {
    if (process.env.NODE_ENV === "development") {
      return LOCAL_RUST_API_URL;
    }

    throw new Error(
      "RUST_API_URL is required for server-side rust API calls in production"
    );
  }

  return serverUrl;
}
