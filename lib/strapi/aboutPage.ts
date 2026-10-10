import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiAboutPage } from "./types";
import { dynamicBlocksPopulate } from "./dynamicBlocksPopulate";

const ABOUT_PAGE_PATH = "api/about";

/** Flatten Strapi v4 response (attributes wrapper) to direct fields */
function flattenStrapiData(raw: unknown): StrapiAboutPage {
  const data = raw as Record<string, unknown>;
  if (!data) return {} as unknown as StrapiAboutPage;
  if (data.attributes && typeof data.attributes === "object") {
    const { attributes, ...rest } = data;
    return { ...rest, ...(attributes as Record<string, unknown>) } as unknown as StrapiAboutPage;
  }
  return data as unknown as StrapiAboutPage;
}

/**
 * Fetches the about page single type with banner, SEO, and dynamic blocks populated.
 */
export async function getAboutPage(options?: {
  revalidate?: number | false;
}): Promise<StrapiAboutPage | null> {
  try {
    const searchParams: Record<string, unknown> = {
      populate: {
        banner: true,
        seo: { populate: "*" },
        blocks: {
          ...dynamicBlocksPopulate(),
        },
      },
    };
    const { data } = await strapiFetch<StrapiAboutPage>({
      path: ABOUT_PAGE_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const page = flattenStrapiData(data);
    absolutizeUploadUrlsDeep(page);
    return page;
  } catch (err) {
    console.error("[getAboutPage]", err);
    return null;
  }
}
