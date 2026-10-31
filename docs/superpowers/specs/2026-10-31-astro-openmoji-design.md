# Astro OpenMoji Design

## Goal

Build one publishable ESM TypeScript package, `astro-openmoji`, that lets authors keep native Unicode emoji in Markdown while Astro renders matching local OpenMoji SVG images at build time. The package emits no client JavaScript and never edits Markdown, `public/`, or other user files.

## Supported platform

The first release targets Astro 7 and Node.js 22 or newer. Astro 7 materializes Sätteri as the configured processor before integration setup hooks run, including when the user did not explicitly select a processor. The integration therefore selects Astro's official `@astrojs/markdown-remark` Unified processor whenever the resolved processor is not Unified. If the project already uses Unified, the integration appends its Rehype plugin to the existing processor options. This behavior is documented because Rehype plugins cannot execute inside Sätteri.

## Public API

The default export is an Astro integration factory:

```ts
openmoji({
  style: "color",
  assetDir: "openmoji",
  className: "openmoji",
});
```

`style` accepts `"color"` or `"black"`. `assetDir` is normalized as a relative URL/path segment and defaults to `openmoji`. `className` defaults to `openmoji`. The `astro-openmoji/rehype` export exposes `rehypeOpenmoji` and its option types for advanced Unified users.

## Rehype transformation

The transformer recursively processes HAST child arrays. It does not descend into `pre` or `code`; raw nodes and element properties are never inspected. Each text node is segmented with `emoji-regex`, preserving non-emoji text exactly. Every complete emoji match is converted to uppercase, hyphen-separated Unicode code points, padding BMP values to four hexadecimal digits.

The transformer first checks the exact OpenMoji filename. If absent, it retries after removing `FE0E` and `FE0F`. If neither asset exists, the original text remains unchanged. A successful match becomes an `img` element with `src`, original emoji `alt`, the configured class, and an inline one-em baseline-alignment style. Nodes are constructed as HAST objects; no HTML strings are concatenated.

## Asset lifecycle

The integration resolves the installed `openmoji` package root once and shares mutable state with the Rehype plugin. Successful replacements add the actual resolved SVG filename to a `Set`.

During `astro dev`, a Connect middleware serves validated `/[base]/[assetDir]/<codepoints>.svg` requests directly from `openmoji/<style>/svg`. Requests must match the canonical filename pattern and remain inside that directory.

During `astro build`, `astro:build:done` copies only filenames recorded by the transformer to `<outDir>/<assetDir>`. The output directory is independent of Astro's URL `base`; generated `src` values include the normalized base, such as `/blog/openmoji/1F680.svg`.

## Error handling

Invalid integration options throw during configuration. Missing individual emoji assets are normal and preserve native emoji. Filesystem copy and middleware read failures other than not-found are surfaced.

## Testing

Unit tests exercise code point generation, variation-selector fallback, complex emoji, missing assets, text contexts, and `pre`/`code` exclusions using real OpenMoji files. A minimal Astro fixture builds with `base: "/blog"`, verifies generated HTML paths, and asserts that `dist/openmoji` contains exactly the SVG files referenced by its Markdown.

## Documentation and licensing

The README documents installation, minimal configuration, behavior, options, development/build mechanics, and licensing. Package code is MIT licensed. Bundled-at-install-time OpenMoji artwork remains CC BY-SA 4.0, documented in `ATTRIBUTION.md` with the suggested visible credit: `Emoji by OpenMoji — CC BY-SA 4.0`.
