// Import the Rust WASM module through the generated JS glue
import init, * as wasmExports from '../_wasm/rust_apis.js';

let wasmInitialized = false;

async function getWasmModule() {
  if (!wasmInitialized) {
    // Import the WASM binary (esbuild will handle this)
    const wasmResponse = await import('../_wasm/rust_apis_bg.wasm');
    
    // Initialize the glue code with the WASM module
    await init(wasmResponse.default || wasmResponse);
    
    if (wasmExports.init_panic_hook) {
      wasmExports.init_panic_hook();
    }
    wasmInitialized = true;
  }
  return wasmExports;
}

interface Env {
  SOLANA_MAINNET_RPC?: string;
  SOLANA_DEVNET_RPC?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    // Get WASM module
    const wasm = await getWasmModule();

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
          
          if (!body.address) {
            status = 400;
            responseBody = JSON.stringify({ error: 'Address is required' });
          } else {
            // Get RPC URL from env
            const rpcUrl = body.cluster === 'mainnet'
              ? env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com'
              : env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com';

            // Call Rust WASM function directly
            const balance = await wasm.get_solana_balance(body.address, rpcUrl);
            responseBody = JSON.stringify({ 
              balance: balance.toString(),
              address: body.address,
              cluster: body.cluster || 'devnet'
            });
          }
        } catch (error) {
          console.error('Balance error:', error);
          status = 500;
          responseBody = JSON.stringify({
            error: `Failed to get balance: ${error}`,
          });
        }
      } else if (method === 'POST' && path === '/wallet/solana/transactions') {
        try {
          const body = await request.json() as any;
          
          if (!body.address) {
            status = 400;
            responseBody = JSON.stringify({ error: 'Address is required' });
          } else {
            // Get RPC URL from env
            const rpcUrl = body.cluster === 'mainnet'
              ? env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com'
              : env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com';

            // Call Rust WASM function directly
            const result = await wasm.get_solana_transactions(body.address, rpcUrl, body.limit);
            // wasm.get_solana_transactions returns a stringified JSON JsValue
            responseBody = typeof result === 'string' ? result : JSON.stringify(result);
          }
        } catch (error) {
          console.error('Transactions error:', error);
          status = 500;
          responseBody = JSON.stringify({
            error: `Failed to get transactions: ${error}`,
          });
        }
      } else if (method === 'POST' && path === '/wallet/solana/send/prepare') {
        try {
          const body = await request.json() as any;
          const rpcUrl = body.cluster === 'mainnet'
            ? env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com'
            : env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com';

          const result = await wasm.get_solana_latest_blockhash(rpcUrl);
          responseBody = typeof result === 'string' ? result : JSON.stringify(result);
        } catch (error) {
          console.error('Prepare error:', error);
          status = 500;
          responseBody = JSON.stringify({
            error: `Failed to prepare transaction: ${error}`,
          });
        }
      } else if (method === 'POST' && path === '/wallet/solana/send') {
        try {
          const body = await request.json() as any;
          
          if (!body.signedTransaction) {
            status = 400;
            responseBody = JSON.stringify({ error: 'Signed transaction is required' });
          } else {
            const rpcUrl = body.cluster === 'mainnet'
              ? env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com'
              : env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com';

            const result = await wasm.send_solana_transaction(body.signedTransaction, rpcUrl);
            responseBody = JSON.stringify({ signature: result });
          }
        } catch (error) {
          console.error('Send error:', error);
          status = 500;
          responseBody = JSON.stringify({
            error: `Failed to send transaction: ${error}`,
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
