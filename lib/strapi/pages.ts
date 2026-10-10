import { strapiFetch } from "./fetcher";
import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import type { StrapiPage } from "./types";
import { dynamicBlocksPopulate } from "./dynamicBlocksPopulate";

const PAGES_PATH = "api/pages";

export interface PagesResponse {
  data: StrapiPage[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Fetches pages with banner, slides, and blocks populated.
 * (Cards/media omitted — not on all Strapi Page schemas.)
 */
export async function getPages(options?: {
  page?: number;
  pageSize?: number;
  revalidate?: number | false;
}): Promise<PagesResponse> {
  const searchParams: Record<string, unknown> = {
    populate: {
      banner: { populate: "*" },
      seo: { populate: "*" },
      blocks: dynamicBlocksPopulate(),
    },
    sort: ["createdAt:desc"],
  };
  if (options?.page != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.page != null) (searchParams.pagination as Record<string, unknown>)["page"] = options.page;
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown>)["pageSize"] = options.pageSize;

  const { data, meta } = await strapiFetch<StrapiPage[]>({
    path: PAGES_PATH,
    searchParams,
    next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
  });

  const pages = Array.isArray(data) ? data : [];
  pages.forEach(absolutizeUploadUrlsDeep);
  return { data: pages, meta: meta as PagesResponse["meta"] };
}

/**
 * Fetches a single page by slug.
 */
export async function getPageBySlug(
  slug: string,
  options?: { revalidate?: number | false }
): Promise<StrapiPage | null> {
  try {
    const searchParams: Record<string, unknown> = {
      filters: { slug: { $eq: slug } },
      populate: {
        banner: { populate: "*" },
        seo: { populate: "*" },
        blocks: dynamicBlocksPopulate(),
      },
    };
    const { data } = await strapiFetch<StrapiPage[]>({
      path: PAGES_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const pages = Array.isArray(data) ? data : [];
    const page = pages[0] ?? null;
    if (page) absolutizeUploadUrlsDeep(page);
    return page ?? null;
  } catch (err) {
    console.error("[getPageBySlug]", err);
    return null;
  }
}
