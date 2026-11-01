# OpenMoji Inline Size Design

## Goal

Make generated OpenMoji glyphs visually comparable to native emoji in surrounding text while preserving the plugin's build-time-only architecture. The default rendered box changes from `1em` to `1.25em`, matching the approved visual option C.

## Problem diagnosis

The plugin currently emits a `1em` square image. OpenMoji artwork commonly leaves substantial space inside its `72 × 72` view box; for example, the main face in `1F613.svg` occupies roughly `48 × 48`. As a result, a one-em image produces a visible glyph substantially smaller than nearby native emoji and text. The SVG remains resolution-independent, so increasing its CSS dimensions improves legibility without introducing raster blur.

The fixed dimensions are also written directly into the generated element's inline `style`. Consumers therefore cannot change `width`, `height`, or `vertical-align` through ordinary class rules without using `!important`.

## Generated style contract

Generated image elements will retain their configured class, asset URL, original emoji `alt`, and inline display behavior. Their inline style will become:

```css
width: var(--openmoji-size, 1.25em);
height: var(--openmoji-size, 1.25em);
vertical-align: var(--openmoji-vertical-align, -0.22em);
display: inline-block;
```

The `1.25em` fallback is the new default. The `-0.22em` fallback keeps the enlarged square aligned with the text baseline without making it appear top-heavy in normal body copy.

The style remains inline so generated emoji retain usable dimensions when a site supplies no stylesheet. CSS custom properties provide a normal-cascade override path even though the consuming properties remain inline.

## Customization

No new JavaScript or TypeScript configuration option will be added. Consumers may override either fallback through the generated class:

```css
.openmoji {
  --openmoji-size: 1.1em;
  --openmoji-vertical-align: -0.15em;
}
```

Custom class names continue to work because the variables are independent of the default class name. A project using `className: "emoji-icon"` applies the same variables to `.emoji-icon`.

## Compatibility

Existing integration and Rehype options remain unchanged. Asset resolution, transformation scope, development serving, and production copying are unaffected. The visible default size changes intentionally for every generated glyph, including emoji in headings, links, lists, quotations, and footnote back-references.

Sites that require the former appearance can set `--openmoji-size: 1em` and `--openmoji-vertical-align: -0.125em` on the generated class. This migration path will be documented.

## Testing

Unit tests will assert the complete default style contract, including the `1.25em` size fallback, `-0.22em` alignment fallback, and CSS custom property names. A custom-class test will continue to verify that changing `className` does not alter the style contract.

The existing Astro fixture will continue to verify generated HTML, copied assets, and zero client JavaScript. The full test suite and package build must pass after the change.

## Documentation

The README's generated HTML example will show the new style. The options or styling section will document both CSS custom properties, their defaults, an override example, and the legacy-size values.

## Non-goals

- Measuring and cropping individual SVG view boxes at build time.
- Assigning per-emoji dimensions.
- Adding runtime JavaScript.
- Changing OpenMoji artwork or asset files.
- Adding a public `size` option in this release.
