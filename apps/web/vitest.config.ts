import path from "node:path";
import { defineConfig } from "vitest/config";

const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globals: true,
    clearMocks: true,
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, ".") },
      {
        find: /^@repo\/api(\/.*)?$/,
        replacement: `${path.join(repoRoot, "packages/api/src")}$1`,
      },
      {
        find: "@repo/store",
        replacement: path.join(repoRoot, "packages/store/src/index.ts"),
      },
      {
        find: "@repo/zod",
        replacement: path.join(repoRoot, "packages/zod/src/index.ts"),
      },
      {
        find: "@repo/constants",
        replacement: path.join(repoRoot, "packages/constants/index.ts"),
      },
    ],
  },
});
