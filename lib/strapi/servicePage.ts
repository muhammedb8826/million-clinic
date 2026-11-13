import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiServicePage } from "./types";
import { dynamicBlocksPopulate } from "./dynamicBlocksPopulate";

const SERVICE_PAGE_PATH = "api/service";

/** Flatten Strapi v4 response (attributes wrapper) to direct fields */
function flattenStrapiData(raw: unknown): StrapiServicePage {
  const data = raw as Record<string, unknown>;
  if (!data) return {} as unknown as StrapiServicePage;
  if (data.attributes && typeof data.attributes === "object") {
    const { attributes, ...rest } = data;
    return { ...rest, ...(attributes as Record<string, unknown>) } as unknown as StrapiServicePage;
  }
  return data as unknown as StrapiServicePage;
}

/**
 * Fetches the service page single type with banner, SEO, and dynamic blocks populated.
 */
export async function getServicePage(options?: {
  revalidate?: number | false;
}): Promise<StrapiServicePage | null> {
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
    const { data } = await strapiFetch<StrapiServicePage>({
      path: SERVICE_PAGE_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const page = flattenStrapiData(data);
    absolutizeUploadUrlsDeep(page);
    return page;
  } catch (err) {
    console.error("[getServicePage]", err);
    return null;
  }
}
