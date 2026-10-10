import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiDefaultSeo, StrapiHomePage, StrapiHomeVideo } from "./types";
import { dynamicBlocksPopulate } from "./dynamicBlocksPopulate";

const HOME_PAGE_PATH = "api/home";

/** Unwrap Strapi relation: flat entry, `{ data }`, or `{ data: { attributes } }`. */
function normalizeStrapiRelation<T>(raw: unknown): T | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if ("data" in o) {
    if (o.data == null) return null;
    const inner = o.data as Record<string, unknown>;
    if (inner.attributes && typeof inner.attributes === "object") {
      return { ...inner, ...(inner.attributes as Record<string, unknown>) } as T;
    }
    return inner as T;
  }
  if (o.attributes && typeof o.attributes === "object") {
    return { ...o, ...(o.attributes as Record<string, unknown>) } as T;
  }
  return o as T;
}

/** Flatten Strapi v4 response (attributes wrapper) to direct fields */
function flattenStrapiData(raw: unknown): StrapiHomePage {
  const data = raw as Record<string, unknown>;
  if (!data) return {} as unknown as StrapiHomePage;
  if (data.attributes && typeof data.attributes === "object") {
    const { attributes, ...rest } = data;
    return { ...rest, ...(attributes as Record<string, unknown>) } as unknown as StrapiHomePage;
  }
  return data as unknown as StrapiHomePage;
}

/**
 * Fetches the home page single type with SEO, articles, projects, and dynamic blocks populated.
 */
export async function getHomePage(options?: {
  revalidate?: number | false;
}): Promise<StrapiHomePage | null> {
  try {
    const searchParams: Record<string, unknown> = {
      populate: {
        seo: { populate: "*" },
        articles: { populate: "*" },
        projects: { populate: "*" },
        events: { populate: "*" },
        blocks: {
          ...dynamicBlocksPopulate(),
        },
      },
    };
    const { data } = await strapiFetch<StrapiHomePage>({
      path: HOME_PAGE_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const home = flattenStrapiData(data);
    // Strapi may return slides as `{ data: Slide[] }` instead of a plain array
    const rawSlides = home.slides as unknown;
    if (
      rawSlides &&
      typeof rawSlides === "object" &&
      Array.isArray((rawSlides as { data?: unknown }).data)
    ) {
      home.slides = (rawSlides as { data: StrapiHomePage["slides"] }).data as StrapiHomePage["slides"];
    }
    home.video = normalizeStrapiRelation<StrapiHomeVideo>(home.video as unknown);
    home.seo = normalizeStrapiRelation<StrapiDefaultSeo>(home.seo as unknown);
    absolutizeUploadUrlsDeep(home);
    return home;
  } catch (err) {
    console.error("[getHomePage]", err);
    return null;
  }
}
