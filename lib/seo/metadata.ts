import type { Metadata } from "next";
import { getGlobal } from "@/lib/strapi";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi/media";
import type { StrapiDefaultSeo } from "@/lib/strapi/types";
import { LOCAL_FALLBACK_SEO } from "./localFallback";

export type PageSeoOverrides = {
  title?: string | null;
  description?: string | null;
  /** Absolute or root-relative image URL for Open Graph / Twitter */
  ogImage?: string | null;
};

export type SeoFallback = {
  defaultSeo?: StrapiDefaultSeo | null;
  siteName?: string | null;
  siteDescription?: string | null;
};

function strapiMediaToOgUrl(media: unknown): string | undefined {
  const m = resolveStrapiMedia(media);
  const url = m?.url ? getStrapiMediaUrl(m.url) : "";
  return url || undefined;
}

/** First non-empty image URL from a Strapi banner field (single media or array). */
export function bannerFieldToOgUrl(banner: unknown): string | undefined {
  if (banner == null) return undefined;
  if (Array.isArray(banner)) {
    for (const item of banner) {
      const u = strapiMediaToOgUrl(item);
      if (u) return u;
    }
    return undefined;
  }
  return strapiMediaToOgUrl(banner);
}

/**
 * Maps Strapi `seo` (same shape as global `defaultSeo`) into {@link PageSeoOverrides}.
 * Use with {@link mergePageMetadata}: page SEO wins first, then global default SEO, then local fallbacks in merge.
 * Only `shareImage` is used for `ogImage` here so missing share images fall through to default or `/mako-foundation.png`.
 */
export function strapiSeoToOverrides(
  seo: StrapiDefaultSeo | null | undefined,
  fallbacks?: { title?: string | null; description?: string | null },
): PageSeoOverrides {
  return {
    title: seo?.metaTitle ?? fallbacks?.title ?? undefined,
    description: seo?.metaDescription ?? fallbacks?.description ?? undefined,
    ogImage: bannerFieldToOgUrl(seo?.shareImage),
  };
}

export async function fetchSeoFallback(options?: {
  revalidate?: number | false;
}): Promise<Required<Pick<SeoFallback, "siteName" | "siteDescription">> & { defaultSeo: StrapiDefaultSeo | null }> {
  try {
    const g = await getGlobal(options);
    return {
      defaultSeo: g.defaultSeo ?? null,
      siteName: g.siteName ?? "",
      siteDescription: g.siteDescription ?? "",
    };
  } catch {
    return { defaultSeo: null, siteName: "", siteDescription: "" };
  }
}

/**
 * Builds Next.js `Metadata` with page overrides first, then Strapi `defaultSeo`,
 * then global `siteName` / `siteDescription`.
 * Open Graph / Twitter image: `overrides.ogImage` (use `seo.shareImage` only from pages; do not substitute
 * banners/covers there), then `defaultSeo.shareImage`, then `LOCAL_FALLBACK_SEO.shareImagePath` (`/mako-foundation.png`).
 */
export function mergePageMetadata(fallback: SeoFallback | null | undefined, overrides: PageSeoOverrides): Metadata {
  const defaultSeo = fallback?.defaultSeo;
  const siteName = fallback?.siteName?.trim() || "";
  const siteDescription = fallback?.siteDescription?.trim() || "";

  const safeTrim = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

  const title =
    safeTrim(overrides.title) ||
    safeTrim(defaultSeo?.metaTitle) ||
    siteName ||
    LOCAL_FALLBACK_SEO.metaTitle;

  const description =
    safeTrim(overrides.description) ||
    safeTrim(defaultSeo?.metaDescription) ||
    siteDescription ||
    LOCAL_FALLBACK_SEO.metaDescription;

  const ogImage =
    safeTrim(overrides.ogImage) ||
    strapiMediaToOgUrl(defaultSeo?.shareImage) ||
    LOCAL_FALLBACK_SEO.shareImagePath;

  const meta: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };

  return meta;
}
