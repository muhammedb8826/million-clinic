import qs from "qs";
import type { StrapiResponse } from "./types";

const getStrapiConfig = () => {
  const baseUrl =
    process.env.STRAPI_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined);
  const token = process.env.STRAPI_TOKEN ?? process.env.NEXT_PUBLIC_API_TOKEN;
  if (!baseUrl) {
    throw new Error(
      "Strapi URL is not set. Configure STRAPI_URL (preferred) or NEXT_PUBLIC_API_URL. " +
        "In Docker/production, set these in your runtime environment."
    );
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
};

export type StrapiFetcherOptions = {
  /** Path after base URL, e.g. "api/global" (no leading slash) */
  path: string;
  /** Query params; use for populate, filters, etc. */
  searchParams?: Record<string, unknown>;
  /** Override default cache (Next.js fetch cache) */
  next?: { revalidate?: number | false; tags?: string[] };
};

/**
 * Reusable Strapi API fetcher. Uses NEXT_PUBLIC_API_URL and NEXT_PUBLIC_API_TOKEN.
 * Returns typed StrapiResponse<T>. Use in Server Components or server code.
 */
export async function strapiFetch<T>(
  options: StrapiFetcherOptions
): Promise<StrapiResponse<T>> {
  const { baseUrl, token } = getStrapiConfig();
  const { path, searchParams = {}, next } = options;

  const url = new URL(path, baseUrl);
  const queryString = qs.stringify(searchParams, {
    encodeValuesOnly: true,
    arrayFormat: "indices",
  });
  if (queryString) url.search = queryString;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(url.toString(), {
    headers,
    next: next ?? { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strapi API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json as StrapiResponse<T>;
}

/**
 * Build populate query for Strapi v4 style: populate[relation][populate]=*
 */
export function buildPopulateParams(
  populates: Record<string, string | boolean>
): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(populates)) {
    if (value === true || value === "*") {
      params[`populate[${key}]`] = "*";
    } else if (typeof value === "string") {
      params[`populate[${key}]`] = value;
    }
  }
  return params;
}
