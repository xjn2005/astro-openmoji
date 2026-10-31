import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/rehype.ts"],
  format: "esm",
  dts: true,
  clean: true,
  fixedExtension: false,
  deps: {
    neverBundle: ["astro"],
    onlyBundle: false,
  },
});
