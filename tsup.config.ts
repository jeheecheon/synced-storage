import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/core/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  clean: true,
  minify: false,
  sourcemap: true,
});
