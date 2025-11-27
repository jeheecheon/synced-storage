import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/core/index.ts", "src/react/index.ts", "src/types/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  clean: true,
  minify: false,
  sourcemap: true,
});
