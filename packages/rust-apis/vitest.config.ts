import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/worker/**/*.spec.ts"],
    environment: "node",
    globals: true,
    clearMocks: true,
  },
});
