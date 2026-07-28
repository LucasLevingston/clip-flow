import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  dts: true,
  clean: true,
  outDir: "dist",
  external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
});
