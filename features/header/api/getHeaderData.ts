import { cache } from "react";
import { getStrapiLocales } from "@/lib/i18n";
import { getGlobal } from "@/lib/strapi/server";
import type { StrapiLocale } from "@/lib/strapi";

export interface HeaderData {
  topHeader: Awaited<ReturnType<typeof getGlobal>>["topHeader"] | null;
  header: Awaited<ReturnType<typeof getGlobal>>["header"] | null;
  footer: Awaited<ReturnType<typeof getGlobal>>["footer"] | null;
  siteName: string;
  siteDescription: string;
  defaultSeo: Awaited<ReturnType<typeof getGlobal>>["defaultSeo"];
  /** Enabled locales from Strapi i18n plugin */
  languages: StrapiLocale[];
}

const REVALIDATE_SECONDS = 60;

async function loadHeaderData(): Promise<HeaderData | null> {
  try {
    const [globalData, languages] = await Promise.all([
      getGlobal({ revalidate: REVALIDATE_SECONDS }),
      getStrapiLocales(),
    ]);

    const topHeader = globalData.topHeader
      ? { ...globalData.topHeader, languages }
      : ({ languages } as HeaderData["topHeader"]);

    return {
      topHeader,
      header: globalData.header,
      footer: globalData.footer,
      siteName: globalData.siteName ?? "",
      siteDescription: globalData.siteDescription ?? "",
      defaultSeo: globalData.defaultSeo,
      languages,
    };
  } catch (err) {
    console.error("[getHeaderData] Strapi global fetch failed:", err);
    try {
      const languages = await getStrapiLocales();
      return {
        topHeader: { languages } as NonNullable<HeaderData["topHeader"]>,
        header: null,
        footer: null,
        siteName: "",
        siteDescription: "",
        defaultSeo: null,
        languages,
      };
    } catch {
      return null;
    }
  }
}

/**
 * Fetches header/footer/global SEO + i18n locales. Wrapped in React `cache()` so multiple
 * calls in the same request (e.g. `generateMetadata` + `RootLayout`) only hit Strapi once.
 */
export const getHeaderData = cache(loadHeaderData);
