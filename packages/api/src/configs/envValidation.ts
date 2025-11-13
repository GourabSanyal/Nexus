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

    if (missingVars.length > 0) {
      console.error(
        `[API Server] ERROR: Missing required environment variables in production:`,
        missingVars.join(", ")
      );
      console.error(
        `[API Server] Please set these variables before starting the server.`
      );
      process.exit(1);
    }
  }
}
