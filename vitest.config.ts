import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^#\//,
        replacement: `${path.resolve(__dirname, "src")}/`,
      },
    ],
  },
  test: {
    include: ["src/**/*.test.ts"],
    // Shared path mocks mutate process-wide dirs; keep files sequential.
    fileParallelism: false,
  },
});
