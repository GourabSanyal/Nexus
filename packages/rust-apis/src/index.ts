// Import Rust WASM functions and the init function from wasm-bindgen generated JS glue
import init, { get_solana_balance, get_solana_transactions } from '../_wasm/rust_apis.js';

// Import the WASM module. Wrangler handles this as a WebAssembly.Module
// @ts-ignore
import wasmModule from '../_wasm/rust_apis_bg.wasm';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    // Initialize the WASM module with the module provided by Wrangler
    await init(wasmModule);
    initialized = true;
  }
}

interface Env {
  SOLANA_MAINNET_RPC?: string;
  SOLANA_DEVNET_RPC?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      // Ensure WASM is initialized before calling any functions
      await ensureInitialized();

      // Route handling
      let responseBody: string;
      let status = 200;

      if (method === 'GET' && path === '/') {
        responseBody = JSON.stringify({
          message: 'Hello from Cloudflare Worker - Rust APIs',
        });
      } else if (method === 'GET' && path === '/health') {
        responseBody = JSON.stringify({
          status: 'ok',
          service: 'rust-apis',
          timestamp: Date.now(),
        });
      } else if (method === 'POST' && path === '/wallet/solana/balance') {
        try {
          const body = await request.json() as any;
          const address = body.address;
          
          if (!address) {
            status = 400;
            responseBody = JSON.stringify({ error: 'Missing address field' });
          } else {
            // Get RPC URL from request body or env
            const rpcUrl = body.cluster === 'mainnet'
              ? env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com'
              : env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com';

            // Call Rust WASM function
            const balanceLamports = await get_solana_balance(address, rpcUrl);
            responseBody = JSON.stringify({
              address,
              balance: balanceLamports.toString(), // Balance is bigint from wasm-bindgen
              balance_sol: Number(balanceLamports) / 1_000_000_000,
              cluster: body.cluster || 'devnet',
            });
          }
        } catch (error) {
          status = 500;
          responseBody = JSON.stringify({
            error: `Failed to get balance: ${error}`,
          });
        }
      } else if (method === 'POST' && path === '/wallet/solana/transactions') {
        try {
          const body = await request.json() as any;
          const address = body.address;
          
          if (!address) {
            status = 400;
            responseBody = JSON.stringify({ error: 'Missing address field' });
          } else {
            // Get RPC URL from request body or env
            const rpcUrl = body.cluster === 'mainnet'
              ? env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com'
              : env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com';

            const limit = body.limit || 20;

            // Call Rust WASM function
            const resultJson = await get_solana_transactions(address, rpcUrl, limit);
            responseBody = typeof resultJson === 'string' ? resultJson : JSON.stringify(resultJson);
          }
        } catch (error) {
          status = 500;
          responseBody = JSON.stringify({
            error: `Failed to get transactions: ${error}`,
          });
        }
      } else {
        status = 404;
        responseBody = JSON.stringify({
          error: 'Not Found',
        });
      }

      return new Response(responseBody, {
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: `Internal server error: ${error}`,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
  },
};
