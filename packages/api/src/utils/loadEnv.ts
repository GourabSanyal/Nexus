import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

function findPackageRoot(startDir: string): string {
  let currentDir = startDir;
  const root = resolve("/");

  while (currentDir !== root) {
    const packageJsonPath = resolve(currentDir, "package.json");
    const envPath = resolve(currentDir, ".env");

    if (existsSync(packageJsonPath) || existsSync(envPath)) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  return resolve(dirname(fileURLToPath(import.meta.url)), "../..");
}

export function loadEnv(): void {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageRoot = findPackageRoot(__dirname);
  const envPath = resolve(packageRoot, ".env");

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn(
      `[API Server] Warning: Could not load .env from ${envPath}:`,
      result.error.message
    );
  } else {
    console.log(`[API Server] Loaded .env from: ${envPath}`);
  }
}
