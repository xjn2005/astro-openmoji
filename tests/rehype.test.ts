import type { Element, Root } from "hast";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import { describe, expect, test } from "vitest";

import { rehypeOpenmoji } from "../src/rehype.js";
import { transformOpenmojiTree } from "../src/transform.js";

async function transform(html: string, options: Parameters<typeof rehypeOpenmoji>[0] = {}) {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeOpenmoji, options)
    .use(rehypeStringify)
    .process(html);

  return String(file);
}

function imageSources(html: string): string[] {
  return [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]);
}

describe("rehypeOpenmoji", () => {
  test("replaces complete basic, ZWJ, skin-tone, variation, and flag sequences", async () => {
    const html = await transform("<p>🚀 😵‍💫 👨🏽‍💻 ❤️ 🇨🇳</p>", {
      base: "/blog",
    });

    expect(imageSources(html)).toEqual([
      "/blog/openmoji/1F680.svg",
      "/blog/openmoji/1F635-200D-1F4AB.svg",
      "/blog/openmoji/1F468-1F3FD-200D-1F4BB.svg",
      "/blog/openmoji/2764.svg",
      "/blog/openmoji/1F1E8-1F1F3.svg",
    ]);
    expect(html).toContain('alt="🚀"');
    expect(html).toContain('alt="😵‍💫"');
    expect(html).toContain('class="openmoji"');
  });

  test("uses readable defaults with CSS custom-property override hooks", async () => {
    const html = await transform("<p>😓</p>");

    expect(html).toContain(
      'style="width:var(--openmoji-size,1.25em);height:var(--openmoji-size,1.25em);vertical-align:var(--openmoji-vertical-align,-0.22em);display:inline-block"',
    );
  });

  test("replaces text in headings, lists, quotes, and links without changing URLs", async () => {
    const html = await transform(
      '<h2>标题 🚀</h2><ul><li>列表 🚀</li></ul><blockquote>引用 🚀</blockquote><a href="https://example.com/🚀">链接 🚀</a>',
    );

    expect(imageSources(html)).toHaveLength(4);
    expect(html).toContain('href="https://example.com/🚀"');
  });

  test("does not replace emoji inside inline code or code blocks", async () => {
    const html = await transform("<p><code>🚀</code> outside 🚀</p><pre><code>😵‍💫 🚀</code></pre>");

    expect(imageSources(html)).toEqual(["/openmoji/1F680.svg"]);
    expect(html).toContain("<code>🚀</code>");
    expect(html).toContain("<pre><code>😵‍💫 🚀</code></pre>");
  });

  test("supports black assets and custom URL directory and class", async () => {
    const html = await transform("<p>🚀</p>", {
      style: "black",
      assetDir: "emoji/assets",
      className: "emoji-icon",
    });

    expect(imageSources(html)).toEqual(["/emoji/assets/1F680.svg"]);
    expect(html).toContain('class="emoji-icon"');
    expect(html).toContain(
      'style="width:var(--openmoji-size,1.25em);height:var(--openmoji-size,1.25em);vertical-align:var(--openmoji-vertical-align,-0.22em);display:inline-block"',
    );
  });

  test("leaves text untouched when no matching asset exists", async () => {
    const tree: Root = {
      type: "root",
      children: [{ type: "text", value: "🚀" }],
    };
    const fakeAssetRoot = new URL("./fixtures/empty-assets/", import.meta.url);

    await transformOpenmojiTree(tree, {
      style: "color",
      assetDir: "openmoji",
      className: "openmoji",
      base: "/",
      assetRoot: fakeAssetRoot,
    });

    expect(tree.children).toEqual([{ type: "text", value: "🚀" }]);
  });

  test("creates HAST image nodes rather than raw HTML", async () => {
    const tree: Root = {
      type: "root",
      children: [{ type: "text", value: "go 🚀 now" }],
    };

    const transformer = rehypeOpenmoji();
    await transformer(tree);

    const image = tree.children[1] as Element;
    expect(tree.children.map((node) => node.type)).toEqual(["text", "element", "text"]);
    expect(image.tagName).toBe("img");
    expect(image.properties.alt).toBe("🚀");
  });
});
