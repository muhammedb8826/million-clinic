import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiEvent } from "./types";

const EVENTS_PATH = "api/events";

export interface EventsResponse {
  data: StrapiEvent[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

function eventsPopulate() {
  return {
    cover: { populate: "*" },
    seo: { populate: "*" },
    organizer: { populate: "*" },
    location: { populate: "*" },
    speakers: { populate: "*" },
    category: { populate: "*" },
  } as const;
}

export async function getEvents(options?: {
  page?: number;
  pageSize?: number;
  featured?: boolean;
  category?: string;
  excludeSlug?: string;
  revalidate?: number | false;
}): Promise<EventsResponse> {
  const searchParams: Record<string, unknown> = {
    populate: eventsPopulate(),
    sort: ["startDate:desc", "createdAt:desc"],
  };
  if (options?.page != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.page != null) (searchParams.pagination as Record<string, unknown>)["page"] = options.page;
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown>)["pageSize"] = options.pageSize;

  if (options?.featured !== undefined) {
    searchParams.filters = {
      ...(searchParams.filters as Record<string, unknown>),
      isFeatured: { $eq: options.featured },
    };
  }
  if (options?.category) {
    searchParams.filters = {
      ...(searchParams.filters as Record<string, unknown>),
      category: { slug: { $eq: options.category } },
    };
  }
  if (options?.excludeSlug) {
    searchParams.filters = {
      ...(searchParams.filters as Record<string, unknown>),
      slug: { $ne: options.excludeSlug },
    };
  }

  const { data, meta } = await strapiFetch<StrapiEvent[]>({
    path: EVENTS_PATH,
    searchParams,
    next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
  });

  const list = Array.isArray(data) ? data : [];
  list.forEach(absolutizeUploadUrlsDeep);
  return { data: list, meta: meta as EventsResponse["meta"] };
}

export async function getEventBySlug(
  slug: string,
  options?: { revalidate?: number | false }
): Promise<StrapiEvent | null> {
  try {
    const searchParams: Record<string, unknown> = {
      filters: { slug: { $eq: slug } },
      populate: eventsPopulate(),
    };
    const { data } = await strapiFetch<StrapiEvent[]>({
      path: EVENTS_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const list = Array.isArray(data) ? data : [];
    const event = list[0] ?? null;
    if (event) absolutizeUploadUrlsDeep(event);
    return event;
  } catch (err) {
    console.error("[getEventBySlug]", err);
    return null;
  }
}

export async function getRelatedEventsByCategory(options: {
  categorySlug: string;
  excludeSlug: string;
  pageSize?: number;
  revalidate?: number | false;
}): Promise<StrapiEvent[]> {
  const res = await getEvents({
    category: options.categorySlug,
    excludeSlug: options.excludeSlug,
    pageSize: options.pageSize ?? 3,
    revalidate: options.revalidate,
  });
  return res.data;
}

