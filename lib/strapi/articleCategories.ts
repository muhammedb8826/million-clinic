import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiArticleCategory } from "./types";

const CATEGORIES_PATH = "api/categories";

/**
 * Fetches all article categories (name, slug, description, articles).
 */
export async function getArticleCategories(options?: {
  revalidate?: number | false;
}): Promise<StrapiArticleCategory[]> {
  try {
    const searchParams: Record<string, string> = {
      "pagination[pageSize]": "100",
      "sort[0]": "name:asc",
      "populate": "*",
    };
    const { data } = await strapiFetch<StrapiArticleCategory[]>({
      path: CATEGORIES_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const list = Array.isArray(data) ? data : [];
    list.forEach(absolutizeUploadUrlsDeep);
    return list;
  } catch (err) {
    console.error("[getArticleCategories]", err);
    return [];
  }
}

