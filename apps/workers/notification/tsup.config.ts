import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["cjs"],
  clean: true,
  outDir: "dist",
  // Bundle everything (internal workspace packages + npm deps like
  // bullmq/ioredis) so the Docker runner stage only needs this worker's
  // own dist/ — no pnpm-specific per-package node_modules to reconstruct.
  noExternal: [/.*/],
});
