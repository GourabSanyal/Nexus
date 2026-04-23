export interface WasmModule {
  init_panic_hook?: () => void;
  handle_request: (request: Request) => Promise<Response>;
}
