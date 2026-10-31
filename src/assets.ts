import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import type { OpenmojiStyle } from "./options.js";

const require = createRequire(import.meta.url);
const packageJsonUrl = pathToFileURL(require.resolve("openmoji/package.json"));

export function openmojiAssetRoot(style: OpenmojiStyle): URL {
  return new URL(`${style}/svg/`, packageJsonUrl);
}

export function emojiCodePoints(emoji: string): string {
  return Array.from(emoji, (character) =>
    character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0"),
  ).join("-");
}

export function emojiFilenameCandidates(emoji: string): string[] {
  const exact = emojiCodePoints(emoji);
  const withoutVariationSelectors = exact
    .split("-")
    .filter((codePoint) => codePoint !== "FE0E" && codePoint !== "FE0F")
    .join("-");

  return withoutVariationSelectors === exact
    ? [`${exact}.svg`]
    : [`${exact}.svg`, `${withoutVariationSelectors}.svg`];
}

export function findEmojiAsset(emoji: string, assetRoot: URL): string | undefined {
  return emojiFilenameCandidates(emoji).find((filename) =>
    existsSync(new URL(filename, assetRoot)),
  );
}
