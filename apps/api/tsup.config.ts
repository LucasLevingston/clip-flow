import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["cjs"],
  clean: true,
  outDir: "dist",
  // Bundle everything so the Docker runner stage only needs this app's own
  // dist/ — no pnpm-specific per-package node_modules to reconstruct.
  noExternal: [/.*/],
});
