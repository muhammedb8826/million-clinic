import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiBoardMember } from "./types";

const BOARD_MEMBERS_PATH = "api/board-members";

export interface BoardMembersResponse {
  data: StrapiBoardMember[];
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
 * Fetches board members with photo and socialLinks populated.
 */
export async function getBoardMembers(options?: {
  page?: number;
  pageSize?: number;
  revalidate?: number | false;
}): Promise<BoardMembersResponse> {
  const searchParams: Record<string, string> = {
    "populate[photo][populate]": "*",
    "populate[socialLinks][populate]": "*",
    "sort[0]": "createdAt:desc",
  };
  if (options?.page != null) searchParams["pagination[page]"] = String(options.page);
  if (options?.pageSize != null) searchParams["pagination[pageSize]"] = String(options.pageSize);

  const { data, meta } = await strapiFetch<StrapiBoardMember[]>({
    path: BOARD_MEMBERS_PATH,
    searchParams,
    next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
  });

  const list = Array.isArray(data) ? data : [];
  list.forEach(absolutizeUploadUrlsDeep);
  return { data: list, meta: meta as BoardMembersResponse["meta"] };
}

/**
 * Fetches a single board member by slug.
 */
export async function getBoardMemberBySlug(
  slug: string,
  options?: { revalidate?: number | false }
): Promise<StrapiBoardMember | null> {
  try {
    const searchParams: Record<string, string> = {
      "filters[slug][$eq]": slug,
      "populate[photo][populate]": "*",
      "populate[socialLinks][populate]": "*",
    };
    const { data } = await strapiFetch<StrapiBoardMember[]>({
      path: BOARD_MEMBERS_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const members = Array.isArray(data) ? data : [];
    const member = members[0] ?? null;
    if (member) absolutizeUploadUrlsDeep(member);
    return member;
  } catch (err) {
    console.error("[getBoardMemberBySlug]", err);
    return null;
  }
}
