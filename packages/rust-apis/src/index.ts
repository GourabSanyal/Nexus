import init, * as wasmExports from "../_wasm/rust_apis.js";

interface WasmModule {
  init_panic_hook?: () => void;
  handle_request: (request: Request) => Promise<Response>;
}

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
  async fetch(request: Request): Promise<Response> {
    try {
      const wasm = await getWasmModule();
      return await wasm.handle_request(request);
    } catch (error) {
      return new Response(JSON.stringify({ error: `Internal server error: ${error}` }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  },
};
