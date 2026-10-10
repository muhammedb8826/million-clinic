import { getStrapiMediaUrl } from "./media";

const UPLOAD_URL_PREFIX = "/uploads/";

function isStrapiUploadPath(url: string): boolean {
  return url.startsWith(UPLOAD_URL_PREFIX);
}

/**
 * Walks any Strapi JSON and absolutizes every `url` (and `previewUrl`) that points at `/uploads/...`.
 * Safe for whole payloads: menu links like `/contact` are unchanged.
 */
export function absolutizeUploadUrlsDeep(root: unknown): void {
  const seen = new WeakSet<object>();
  const walk = (v: unknown): void => {
    if (v == null || typeof v !== "object") return;
    if (seen.has(v as object)) return;
    seen.add(v as object);
    if (Array.isArray(v)) {
      for (const item of v) walk(item);
      return;
    }
    const o = v as Record<string, unknown>;
    for (const key of Object.keys(o)) {
      const val = o[key];
      if (
        (key === "url" || key === "previewUrl") &&
        typeof val === "string" &&
        isStrapiUploadPath(val)
      ) {
        const abs = getStrapiMediaUrl(val);
        if (abs) o[key] = abs;
      } else {
        walk(val);
      }
    }
  };
  walk(root);
}
