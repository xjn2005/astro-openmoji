# Astro OpenMoji Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a publishable Astro 7 integration that converts Markdown emoji to local OpenMoji SVG images without modifying source files or adding client JavaScript.

**Architecture:** A focused Rehype transformer performs safe HAST text-node replacement and records resolved assets. The Astro integration registers that transformer with the official Unified processor, serves assets through a development middleware, and copies only recorded assets after production builds.

**Tech Stack:** TypeScript, ESM, Astro 7, @astrojs/markdown-remark, Unified/Rehype/HAST, emoji-regex, OpenMoji, Vitest, tsdown.

---

## File map

- `src/options.ts`: public option types and validation/normalization.
- `src/assets.ts`: OpenMoji package resolution, code-point candidates, and asset lookup.
- `src/rehype.ts`: public Rehype plugin and safe HAST transformation.
- `src/index.ts`: Astro integration hooks, Unified registration, dev middleware, and build copying.
- `tests/rehype.test.ts`: isolated transformation behavior.
- `tests/integration.test.ts`: Astro fixture build and emitted asset assertions.
- `tests/fixtures/blog/*`: minimal base-path Astro blog fixture.
- `README.md`, `LICENSE`, `ATTRIBUTION.md`: user documentation and licensing.

### Task 1: Package scaffold

- [ ] Create `package.json`, `tsconfig.json`, `tsdown.config.ts`, and `vitest.config.ts` with ESM exports for `.` and `./rehype`.
- [ ] Install exact current dependencies and inspect installed Astro/OpenMoji type and package layouts.
- [ ] Run the empty build/type pipeline and correct configuration errors.

### Task 2: Rehype transformation (RED-GREEN-REFACTOR)

- [ ] Write failing `tests/rehype.test.ts` cases for `🚀`, `😵‍💫`, `👨🏽‍💻`, `❤️`, `🇨🇳`, missing assets, links, and skipped `pre`/`code`.
- [ ] Run the focused test and confirm failure is caused by the missing public plugin.
- [ ] Implement option normalization, code-point filename candidates, asset lookup, and HAST replacement in `src/options.ts`, `src/assets.ts`, and `src/rehype.ts`.
- [ ] Run the focused test until green, then refactor while preserving green tests.

### Task 3: Astro integration (RED-GREEN-REFACTOR)

- [ ] Create the Markdown fixture and a failing `tests/integration.test.ts` that runs Astro's real build API.
- [ ] Assert `/blog/openmoji/...` output, skipped code emoji, no client script, and an exact emitted SVG filename set.
- [ ] Run the integration test and confirm it fails because the integration entry point is absent.
- [ ] Implement Astro 7 Unified registration, shared build state, development middleware, and `astro:build:done` copying in `src/index.ts`.
- [ ] Run the focused integration test until green and rerun the complete suite.

### Task 4: Package documentation

- [ ] Add the MIT `LICENSE` and OpenMoji `ATTRIBUTION.md`.
- [ ] Write `README.md` with install/configuration examples, before/after output, API options, dev/build behavior, compatibility, and attribution.
- [ ] Confirm the npm `files` list includes runtime output and legal/documentation files but excludes tests and fixtures.

### Task 5: Verification

- [ ] Run `npm test` and require all unit and fixture tests to pass.
- [ ] Run `npm run build` and require clean TypeScript declarations plus ESM bundles.
- [ ] Run `npm pack --dry-run` and inspect the complete package file list.
- [ ] Inspect final project structure and Git/workspace status without creating a commit.
