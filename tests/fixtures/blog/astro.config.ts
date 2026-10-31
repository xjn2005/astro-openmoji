import { defineConfig } from "astro/config";

import openmoji from "../../../src/index.ts";

export default defineConfig({
  base: "/blog",
  integrations: [openmoji()],
});
