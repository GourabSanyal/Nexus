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
    alias: {
      "@": path.resolve(__dirname, "."),
      "@api-types": path.join(repoRoot, "packages/api/src/types"),
      "@repo/store/src/enums/network": path.join(
        repoRoot,
        "packages/store/src/enums/network.ts"
      ),
      "@my-org/store": path.join(repoRoot, "packages/store/src/index.ts"),
      "@repo/store": path.join(repoRoot, "packages/store/src"),
    },
  },
});
