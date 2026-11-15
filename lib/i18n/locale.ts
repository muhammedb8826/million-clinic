import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { StrapiLocale } from "@/lib/strapi/types";
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALES as CLIENT_FALLBACK_LOCALES,
  LOCALE_COOKIE,
} from "./locale-client";

export {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  RTL_LOCALES,
  localeDirection,
} from "./locale-client";

/** Fallback if Strapi i18n locales cannot be fetched */
export const FALLBACK_LOCALES: StrapiLocale[] = CLIENT_FALLBACK_LOCALES.map((l) => ({
  code: l.code,
  name: l.name,
  isDefault: l.isDefault,
}));

function getStrapiBaseConfig() {
  const baseUrl =
    process.env.STRAPI_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined);
  const token = process.env.STRAPI_TOKEN ?? process.env.NEXT_PUBLIC_API_TOKEN;
  if (!baseUrl) {
    throw new Error("Strapi URL is not set for locale fetch.");
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
}

type StrapiLocaleRow = {
  id?: number;
  code?: string;
  name?: string;
  isDefault?: boolean;
};

function normalizeLocales(raw: unknown): StrapiLocale[] {
  const rows: StrapiLocaleRow[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: unknown })?.data)
      ? ((raw as { data: StrapiLocaleRow[] }).data)
      : [];

  const locales = rows
    .filter((row): row is StrapiLocaleRow & { code: string; name: string } =>
      Boolean(row?.code && row?.name),
    )
    .map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      isDefault: Boolean(row.isDefault),
    }));

  return locales.length > 0 ? locales : FALLBACK_LOCALES;
}

/**
 * Fetches enabled locales from Strapi i18n plugin (`GET /api/i18n/locales`).
 * Cached per request via React `cache()`.
 */
export const getStrapiLocales = cache(async (): Promise<StrapiLocale[]> => {
  try {
    const { baseUrl, token } = getStrapiBaseConfig();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await fetch(`${baseUrl}/api/i18n/locales`, {
      headers,
      next: { revalidate: 300, tags: ["strapi-locales"] },
    });
    if (!res.ok) {
      console.error(`[getStrapiLocales] ${res.status}: ${await res.text()}`);
      return FALLBACK_LOCALES;
    }
    return normalizeLocales(await res.json());
  } catch (err) {
    console.error("[getStrapiLocales]", err);
    return FALLBACK_LOCALES;
  }
});

export const getDefaultLocale = cache(async (): Promise<string> => {
  const locales = await getStrapiLocales();
  return locales.find((l) => l.isDefault)?.code ?? locales[0]?.code ?? DEFAULT_LOCALE;
});

/**
 * Active locale for this request: cookie if valid against Strapi locales, else default.
 */
export const getRequestLocale = cache(async (): Promise<string> => {
  const locales = await getStrapiLocales();
  const codes = new Set(locales.map((l) => l.code));
  const defaultCode =
    locales.find((l) => l.isDefault)?.code ?? locales[0]?.code ?? DEFAULT_LOCALE;

  try {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
    if (fromCookie && codes.has(fromCookie)) return fromCookie;
  } catch {
    // Outside a request context (e.g. build) — use default
  }

  return defaultCode;
});
