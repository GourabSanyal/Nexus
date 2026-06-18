import init, * as wasmExports from "../_wasm/rust_apis.js";
import { resolveCorsOrigin } from "./cors";
import { ENV_TO_HEADER, type Env } from "./env";
import type { WasmModule } from "./wasm";

let wasmInitialized = false;

async function getWasmModule(): Promise<WasmModule> {
  if (!wasmInitialized) {
    const wasmResponse = await import("../_wasm/rust_apis_bg.wasm");
    await init(wasmResponse.default || wasmResponse);
    if (wasmExports.init_panic_hook) {
      wasmExports.init_panic_hook();
    }
    wasmInitialized = true;
  }

  return wasmExports as unknown as WasmModule;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const wasm = await getWasmModule();
      const headers = new Headers(request.headers);

      for (const { envKey, header } of ENV_TO_HEADER) {
        if (envKey === "CORS_ORIGIN") {
          continue;
        }

        const value = env[envKey];
        if (value) {
          headers.set(header, value);
        }
      }

      const corsOrigin = resolveCorsOrigin(
        request.headers.get("Origin"),
        env.CORS_ORIGIN
      );
      headers.set("x-cors-origin", corsOrigin);

      const requestWithEnv = new Request(request, { headers });
      return await wasm.handle_request(requestWithEnv);
    } catch (error) {
      const corsOrigin = resolveCorsOrigin(
        request.headers.get("Origin"),
        env.CORS_ORIGIN
      );

      return new Response(JSON.stringify({ error: `Internal server error: ${error}` }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": corsOrigin,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
  },
};
