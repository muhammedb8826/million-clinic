/**
 * Returns full URL for a Strapi media path (e.g. /uploads/...).
 * Uses NEXT_PUBLIC_API_URL; safe to use in client components.
 * In production, set NEXT_PUBLIC_API_URL to your Strapi origin (e.g. https://api.example.com)
 * so uploads resolve correctly; otherwise relative paths are returned and images may 404.
 */
export function getStrapiMediaUrl(path: string | null | undefined): string {
  if (path == null || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const base = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL ?? "" : "";
  const baseStr = typeof base === "string" ? base.trim() : "";
  return baseStr ? `${baseStr.replace(/\/$/, "")}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}` : trimmed;
}

/** Strapi media in flat form (url, width, height, etc.) */
interface FlatMedia {
  url?: string | null;
  width?: number;
  height?: number;
  alternativeText?: string | null;
  [key: string]: unknown;
}

/**
 * Resolves logo/media from Strapi relation. Handles both flat shape and v4 relation shape (data / data.attributes).
 */
export function resolveStrapiMedia(relation: unknown): FlatMedia | null {
  if (relation == null) return null;
  const r = relation as Record<string, unknown>;
  if (typeof r.url === "string") return r as FlatMedia;
  const attrs = (r.data as Record<string, unknown> | undefined)?.attributes ?? r.attributes;
  if (attrs && typeof (attrs as Record<string, unknown>).url === "string") return attrs as FlatMedia;
  return null;
}
