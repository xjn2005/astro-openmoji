import type { Root } from "hast";
import type { Plugin } from "unified";

import { openmojiAssetRoot } from "./assets.js";
import { normalizeBase, resolveOptions, type OpenmojiOptions } from "./options.js";
import { transformOpenmojiTree } from "./transform.js";

export interface RehypeOpenmojiOptions extends OpenmojiOptions {
  /** URL base prepended to generated asset paths. @default "/" */
  base?: string;
}

export const rehypeOpenmoji: Plugin<[RehypeOpenmojiOptions?], Root> = (options = {}) => {
  const resolved = resolveOptions(options);
  const assetRoot = openmojiAssetRoot(resolved.style);

  return (tree) => {
    transformOpenmojiTree(tree, {
      ...resolved,
      base: normalizeBase(options.base),
      assetRoot,
    });
  };
};

export type { OpenmojiOptions, OpenmojiStyle } from "./options.js";
