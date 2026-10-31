import type { Element, ElementContent, Parents, Root, Text } from "hast";
import emojiRegex from "emoji-regex";

import { findEmojiAsset } from "./assets.js";
import { assetUrl } from "./options.js";

export interface TransformOpenmojiOptions {
  style: "color" | "black";
  assetDir: string;
  className: string;
  base: string;
  assetRoot: URL;
  onAsset?: (filename: string) => void;
}

const skippedElements = new Set(["code", "pre"]);
const imageStyle = "width:1em;height:1em;vertical-align:-0.125em;display:inline-block";

export function transformOpenmojiTree(tree: Root, options: TransformOpenmojiOptions): void {
  transformChildren(tree, options);
}

function transformChildren(parent: Parents, options: TransformOpenmojiOptions): void {
  const children: ElementContent[] = [];

  for (const child of parent.children) {
    if (child.type === "text") {
      children.push(...transformText(child, options));
      continue;
    }

    if (child.type === "element" && !skippedElements.has(child.tagName)) {
      transformChildren(child, options);
    }
    children.push(child as ElementContent);
  }

  parent.children = children;
}

function transformText(node: Text, options: TransformOpenmojiOptions): ElementContent[] {
  const nodes: ElementContent[] = [];
  let cursor = 0;

  for (const match of node.value.matchAll(emojiRegex())) {
    const emoji = match[0];
    const index = match.index;
    if (index > cursor) {
      nodes.push({ type: "text", value: node.value.slice(cursor, index) });
    }

    const filename = findEmojiAsset(emoji, options.assetRoot);
    if (filename === undefined) {
      nodes.push({ type: "text", value: emoji });
    } else {
      options.onAsset?.(filename);
      nodes.push(createImage(emoji, filename, options));
    }
    cursor = index + emoji.length;
  }

  if (cursor === 0) return [node];
  if (cursor < node.value.length) {
    nodes.push({ type: "text", value: node.value.slice(cursor) });
  }
  return nodes;
}

function createImage(
  emoji: string,
  filename: string,
  options: TransformOpenmojiOptions,
): Element {
  return {
    type: "element",
    tagName: "img",
    properties: {
      className: [options.className],
      src: assetUrl(options.base, options.assetDir, filename),
      alt: emoji,
      style: imageStyle,
    },
    children: [],
  };
}
