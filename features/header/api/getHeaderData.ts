import { cache } from "react";
import { getGlobal } from "@/lib/strapi";

export interface HeaderData {
  topHeader: Awaited<ReturnType<typeof getGlobal>>["topHeader"];
  header: Awaited<ReturnType<typeof getGlobal>>["header"];
  footer: Awaited<ReturnType<typeof getGlobal>>["footer"];
  siteName: string;
  siteDescription: string;
  defaultSeo: Awaited<ReturnType<typeof getGlobal>>["defaultSeo"];
}

const REVALIDATE_SECONDS = 60;

async function loadHeaderData(): Promise<HeaderData | null> {
  try {
    const globalData = await getGlobal({ revalidate: REVALIDATE_SECONDS });
    return {
      topHeader: globalData.topHeader,
      header: globalData.header,
      footer: globalData.footer,
      siteName: globalData.siteName ?? "",
      siteDescription: globalData.siteDescription ?? "",
      defaultSeo: globalData.defaultSeo,
    };
  } catch (err) {
    console.error("[getHeaderData] Strapi global fetch failed:", err);
    return null;
  }
}

/**
 * Fetches header/footer/global SEO. Wrapped in React `cache()` so multiple calls in the same
 * request (e.g. `generateMetadata` + `RootLayout`) only hit Strapi once.
 */
export const getHeaderData = cache(loadHeaderData);
