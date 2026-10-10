import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiArticle } from "./types";
import { dynamicBlocksPopulate } from "./dynamicBlocksPopulate";

const ARTICLES_PATH = "api/articles";

export interface ArticlesResponse {
  data: StrapiArticle[];
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
 * Fetches articles list with category, cover, and blocks populated.
 */
export async function getArticles(options?: {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
  excludeSlug?: string;
  revalidate?: number | false;
}): Promise<ArticlesResponse> {
  const searchParams: Record<string, unknown> = {
    populate: {
      seo: { populate: "*" },
      category: { populate: "*" },
      cover: { populate: "*" },
      blocks: dynamicBlocksPopulate(),
    },
    sort: ["createdAt:desc"],
  };
  if (options?.page != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.page != null) (searchParams.pagination as Record<string, unknown>)["page"] = options.page;
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown>)["pageSize"] = options.pageSize;
  if (options?.category) {
    searchParams.filters = { ...(searchParams.filters as Record<string, unknown>), category: { slug: { $eq: options.category } } };
  }
  if (options?.featured !== undefined) {
    searchParams.filters = { ...(searchParams.filters as Record<string, unknown>), isFeatured: { $eq: options.featured } };
  }
  if (options?.excludeSlug) {
    searchParams.filters = { ...(searchParams.filters as Record<string, unknown>), slug: { $ne: options.excludeSlug } };
  }

  const { data, meta } = await strapiFetch<StrapiArticle[]>({
    path: ARTICLES_PATH,
    searchParams,
    next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
  });

  const list = Array.isArray(data) ? data : [];
  list.forEach(absolutizeUploadUrlsDeep);
  return { data: list, meta: meta as ArticlesResponse["meta"] };
}

/**
 * Fetches a single article by slug.
 */
export async function getArticleBySlug(
  slug: string,
  options?: { revalidate?: number | false }
): Promise<StrapiArticle | null> {
  try {
    const searchParams: Record<string, unknown> = {
      filters: { slug: { $eq: slug } },
      populate: {
        seo: { populate: "*" },
        category: { populate: "*" },
        cover: { populate: "*" },
        blocks: dynamicBlocksPopulate(),
      },
    };
    const { data } = await strapiFetch<StrapiArticle[]>({
      path: ARTICLES_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const articles = Array.isArray(data) ? data : [];
    const article = articles[0] ?? null;
    if (article) absolutizeUploadUrlsDeep(article);
    return article;
  } catch {
    return null;
  }
}
