import { readdir, readFile, rm } from "node:fs/promises";

import { build, dev } from "astro";
import { beforeEach, describe, expect, test } from "vitest";

const fixtureRoot = new URL("./fixtures/blog/", import.meta.url);
const outputRoot = new URL("./dist/", fixtureRoot);

describe("Astro integration", () => {
  beforeEach(async () => {
    await rm(outputRoot, { recursive: true, force: true });
  });

  test("builds base-aware HTML and copies only SVGs used outside code", async () => {
    await build({ root: fixtureRoot, logLevel: "silent" });

    const html = await readFile(new URL("./index.html", outputRoot), "utf8");
    expect(html).toContain('/blog/openmoji/1F680.svg');
    expect(html).toContain('/blog/openmoji/1F635-200D-1F4AB.svg');
    expect(html).toContain('/blog/openmoji/1F468-1F3FD-200D-1F4BB.svg');
    expect(html).toContain('/blog/openmoji/2764.svg');
    expect(html).toContain('/blog/openmoji/1F1E8-1F1F3.svg');
    expect(html).toContain("inline 🐛");
    expect(html).toContain("block 🐛");
    expect(html).not.toContain("<script");

    const emittedAssets = (await readdir(new URL("./openmoji/", outputRoot))).sort();
    expect(emittedAssets).toEqual(
      [
        "1F680.svg",
        "1F635-200D-1F4AB.svg",
        "1F468-1F3FD-200D-1F4BB.svg",
        "2764.svg",
        "1F1E8-1F1F3.svg",
      ].sort(),
    );
  });

  test("serves OpenMoji SVGs from the installed package during astro dev", async () => {
    const server = await dev({
      root: fixtureRoot,
      logLevel: "silent",
      server: { host: "127.0.0.1", port: 0 },
    });

    try {
      const response = await fetch(
        `http://127.0.0.1:${server.address.port}/blog/openmoji/1F680.svg`,
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("image/svg+xml");
      expect(await response.text()).toContain("<svg");
    } finally {
      await server.stop();
    }
  });
});
