import "server-only";
import qs from "qs";
import { getRequestLocale } from "@/lib/i18n";
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
  /**
   * Strapi i18n locale. Defaults to the request locale cookie.
   * Pass `false` to omit `locale` (e.g. non-localized endpoints).
   */
  locale?: string | false;
  /** Override default cache (Next.js fetch cache) */
  next?: { revalidate?: number | false; tags?: string[] };
};

/**
 * Reusable Strapi API fetcher. Uses NEXT_PUBLIC_API_URL and NEXT_PUBLIC_API_TOKEN.
 * Automatically sends `locale` from the NEXT_LOCALE cookie unless overridden.
 * Returns typed StrapiResponse<T>. Use in Server Components or server code.
 */
export async function strapiFetch<T>(
  options: StrapiFetcherOptions
): Promise<StrapiResponse<T>> {
  const { baseUrl, token } = getStrapiConfig();
  const { path, next } = options;
  const searchParams: Record<string, unknown> = { ...(options.searchParams ?? {}) };

  if (options.locale !== false && searchParams.locale == null) {
    searchParams.locale =
      typeof options.locale === "string" ? options.locale : await getRequestLocale();
  }

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
