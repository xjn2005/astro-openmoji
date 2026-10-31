export type OpenmojiStyle = "color" | "black";

export interface OpenmojiOptions {
  /** OpenMoji artwork style. @default "color" */
  style?: OpenmojiStyle;
  /** Public URL directory for emitted SVG files. @default "openmoji" */
  assetDir?: string;
  /** CSS class placed on generated image elements. @default "openmoji" */
  className?: string;
}

export interface ResolvedOpenmojiOptions {
  style: OpenmojiStyle;
  assetDir: string;
  className: string;
}

export function resolveOptions(options: OpenmojiOptions = {}): ResolvedOpenmojiOptions {
  const style = options.style ?? "color";
  if (style !== "color" && style !== "black") {
    throw new TypeError('astro-openmoji: "style" must be "color" or "black".');
  }

  const assetDir = normalizeAssetDir(options.assetDir ?? "openmoji");
  const className = options.className ?? "openmoji";
  if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(className)) {
    throw new TypeError('astro-openmoji: "className" must be a single valid CSS class name.');
  }

  return { style, assetDir, className };
}

export function normalizeAssetDir(value: string): string {
  const normalized = value.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  const segments = normalized.split("/");
  if (
    normalized.length === 0 ||
    segments.some(
      (segment) =>
        segment === "." ||
        segment === ".." ||
        !/^[A-Za-z0-9][A-Za-z0-9._~-]*$/.test(segment),
    )
  ) {
    throw new TypeError(
      'astro-openmoji: "assetDir" must be a non-empty relative URL path without dot segments.',
    );
  }
  return normalized;
}

export function normalizeBase(value: string | undefined): string {
  const normalized = `/${(value ?? "/").replaceAll("\\", "/")}`.replace(/\/{2,}/g, "/");
  return normalized === "/" ? "/" : `${normalized.replace(/^\/+|\/+$/g, "")}/`.replace(/^/, "/");
}

export function assetUrl(base: string, assetDir: string, filename: string): string {
  return `${normalizeBase(base)}${assetDir}/${filename}`;
}
