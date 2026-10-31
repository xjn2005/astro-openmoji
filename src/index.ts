import { copyFile, mkdir, readFile } from "node:fs/promises";

import { isUnifiedProcessor, unified } from "@astrojs/markdown-remark";
import type { AstroIntegration } from "astro";
import type { Root } from "hast";
import type { Plugin } from "unified";

import { openmojiAssetRoot } from "./assets.js";
import {
  normalizeBase,
  resolveOptions,
  type OpenmojiOptions,
} from "./options.js";
import { transformOpenmojiTree } from "./transform.js";

const svgFilenamePattern = /^[0-9A-F]{4,6}(?:-[0-9A-F]{4,6})*\.svg$/;

export default function openmoji(options: OpenmojiOptions = {}): AstroIntegration {
  const resolved = resolveOptions(options);
  const assetRoot = openmojiAssetRoot(resolved.style);
  const usedAssets = new Set<string>();
  const state = { base: "/" };

  const plugin: Plugin<[], Root> = () => (tree) => {
    transformOpenmojiTree(tree, {
      ...resolved,
      base: state.base,
      assetRoot,
      onAsset: (filename) => usedAssets.add(filename),
    });
  };

  return {
    name: "astro-openmoji",
    hooks: {
      "astro:config:setup": ({ config, updateConfig }) => {
        state.base = normalizeBase(config.base);
        const processor = config.markdown?.processor;

        if (processor === undefined || !isUnifiedProcessor(processor)) {
          updateConfig({
            markdown: {
              processor: unified({ rehypePlugins: [plugin] }),
            },
          });
          return;
        }

        processor.options.rehypePlugins.push(plugin);
      },

      "astro:config:done": ({ config }) => {
        state.base = normalizeBase(config.base);
      },

      "astro:server:setup": ({ server }) => {
        const assetPrefix = `${state.base}${resolved.assetDir}/`;

        server.middlewares.use(async (request, response, next) => {
          if (request.method !== "GET" && request.method !== "HEAD") {
            next();
            return;
          }

          let pathname: string;
          try {
            pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
          } catch {
            next();
            return;
          }

          if (!pathname.startsWith(assetPrefix)) {
            next();
            return;
          }

          const filename = pathname.slice(assetPrefix.length);
          if (!svgFilenamePattern.test(filename)) {
            next();
            return;
          }

          try {
            const svg = await readFile(new URL(filename, assetRoot));
            response.statusCode = 200;
            response.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
            response.setHeader("Cache-Control", "public, max-age=3600");
            response.setHeader("Content-Length", svg.byteLength);
            response.end(request.method === "HEAD" ? undefined : svg);
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
              next();
            } else {
              next(error as Error);
            }
          }
        });
      },

      "astro:build:start": () => {
        usedAssets.clear();
      },

      "astro:build:done": async ({ dir }) => {
        if (usedAssets.size === 0) return;

        const outputRoot = new URL(`${resolved.assetDir}/`, dir);
        await mkdir(outputRoot, { recursive: true });
        await Promise.all(
          [...usedAssets].map((filename) =>
            copyFile(new URL(filename, assetRoot), new URL(filename, outputRoot)),
          ),
        );
      },
    },
  };
}

export type { OpenmojiOptions, OpenmojiStyle } from "./options.js";
