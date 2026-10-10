import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiPartner } from "./types";

const PARTNERS_PATH = "api/partners";

export interface PartnersResponse {
  data: StrapiPartner[];
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
 * Fetches partners with logo populated.
 */
export async function getPartners(options?: {
  page?: number;
  pageSize?: number;
  revalidate?: number | false;
}): Promise<PartnersResponse> {
  const searchParams: Record<string, unknown> = {
    populate: { logo: { populate: "*" } },
    sort: ["createdAt:desc"],
  };
  if (options?.page != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.page != null) (searchParams.pagination as Record<string, unknown>)["page"] = options.page;
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown>)["pageSize"] = options.pageSize;

  const { data, meta } = await strapiFetch<StrapiPartner[]>({
    path: PARTNERS_PATH,
    searchParams,
    next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
  });

  const list = Array.isArray(data) ? data : [];
  list.forEach(absolutizeUploadUrlsDeep);
  return { data: list, meta: meta as PartnersResponse["meta"] };
}

/**
 * Fetches a single partner by slug.
 */
export async function getPartnerBySlug(
  slug: string,
  options?: { revalidate?: number | false },
): Promise<StrapiPartner | null> {
  try {
    const searchParams: Record<string, unknown> = {
      filters: { slug: { $eq: slug } },
      populate: { logo: { populate: "*" } },
    };
    const { data } = await strapiFetch<StrapiPartner[]>({
      path: PARTNERS_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const partners = Array.isArray(data) ? data : [];
    const partner = partners[0] ?? null;
    if (partner) absolutizeUploadUrlsDeep(partner);
    return partner;
  } catch (err) {
    console.error("[getPartnerBySlug]", err);
    return null;
  }
}

