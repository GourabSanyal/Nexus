// this is for production validation for env variables missing error
export function validateEnv(): void {
  const NODE_ENV = process.env.NODE_ENV || "development";

  if (NODE_ENV === "production") {
    const requiredEnvVars = [
      "ETHEREUM_MAINNET",
      "ETHEREUM_SEPOLIA",
      "ETHEREUM_HOLESKY",
      "CORS_ORIGIN",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    const missingSolanaVars = [
      ["SOLANA_MAINNET", "SOLANA_MAINNET_RPC"],
      ["SOLANA_DEVNET", "SOLANA_DEVNET_RPC"],
    ].filter(([primary, fallback]) => !process.env[primary] && !process.env[fallback]);

    const missingVarNames = [
      ...missingVars,
      ...missingSolanaVars.map(([primary, fallback]) => `${primary} or ${fallback}`),
    ];

    if (missingVarNames.length > 0) {
      console.error(
        `[API Server] ERROR: Missing required environment variables in production:`,
        missingVarNames.join(", ")
      );
      console.error(
        `[API Server] Please set these variables before starting the server.`
      );
      process.exit(1);
    }
  }
}
