import { strapiFetch } from "./fetcher";

export type AdjacentItem = {
  slug: string;
  title: string;
};

type AdjacentOptions = {
  path: string;
  /** ISO date used for ordering (usually createdAt) */
  createdAt: string;
  excludeSlug: string;
  /** Field used as display title: title | name | fullName */
  titleField?: "title" | "name" | "fullName";
  /** Optional secondary date field for events (startDate) */
  dateField?: "createdAt" | "startDate";
  dateValue?: string;
  revalidate?: number | false;
};

type SlugTitleRow = {
  slug?: string;
  title?: string;
  name?: string;
  fullName?: string;
};

function pickTitle(row: SlugTitleRow, field: AdjacentOptions["titleField"]): string {
  if (field === "name") return row.name?.trim() || row.slug || "";
  if (field === "fullName") return row.fullName?.trim() || row.slug || "";
  return row.title?.trim() || row.slug || "";
}

function toItem(row: SlugTitleRow | undefined, field: AdjacentOptions["titleField"]): AdjacentItem | null {
  if (!row?.slug) return null;
  const title = pickTitle(row, field);
  if (!title) return null;
  return { slug: row.slug, title };
}

/**
 * Fetches the older (previous) and newer (next) items relative to the current
 * entry, matching list sort order of createdAt:desc (or startDate:desc for events).
 */
export async function getAdjacentItems(
  options: AdjacentOptions,
): Promise<{ older: AdjacentItem | null; newer: AdjacentItem | null }> {
  const titleField = options.titleField ?? "title";
  const dateField = options.dateField ?? "createdAt";
  const dateValue = options.dateValue ?? options.createdAt;
  const baseFilters = { slug: { $ne: options.excludeSlug } };

  try {
    const [olderRes, newerRes] = await Promise.all([
      strapiFetch<SlugTitleRow[]>({
        path: options.path,
        searchParams: {
          filters: {
            ...baseFilters,
            [dateField]: { $lt: dateValue },
          },
          sort: [`${dateField}:desc`],
          pagination: { page: 1, pageSize: 1 },
        },
        next: options.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
      }),
      strapiFetch<SlugTitleRow[]>({
        path: options.path,
        searchParams: {
          filters: {
            ...baseFilters,
            [dateField]: { $gt: dateValue },
          },
          sort: [`${dateField}:asc`],
          pagination: { page: 1, pageSize: 1 },
        },
        next: options.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
      }),
    ]);

    const olderList = Array.isArray(olderRes.data) ? olderRes.data : [];
    const newerList = Array.isArray(newerRes.data) ? newerRes.data : [];

    return {
      older: toItem(olderList[0], titleField),
      newer: toItem(newerList[0], titleField),
    };
  } catch {
    return { older: null, newer: null };
  }
}
