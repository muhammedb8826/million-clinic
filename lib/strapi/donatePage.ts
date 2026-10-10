import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiDonatePage } from "./types";
import { dynamicBlocksPopulate } from "./dynamicBlocksPopulate";

const DONATE_PAGE_PATH = "api/donate";

function flattenStrapiData(raw: unknown): StrapiDonatePage {
  const data = raw as Record<string, unknown>;
  if (!data) return {} as unknown as StrapiDonatePage;
  if (data.attributes && typeof data.attributes === "object") {
    const { attributes, ...rest } = data;
    return { ...rest, ...(attributes as Record<string, unknown>) } as unknown as StrapiDonatePage;
  }
  return data as unknown as StrapiDonatePage;
}

/**
 * Fetches the donate page single type with SEO and all dynamic-zone blocks populated.
 */
export async function getDonatePage(options?: {
  revalidate?: number | false;
}): Promise<StrapiDonatePage | null> {
  try {
    const searchParams: Record<string, unknown> = {
      populate: {
        seo: { populate: "*" },
        blocks: {
          ...dynamicBlocksPopulate(),
        },
      },
    };
    const { data } = await strapiFetch<StrapiDonatePage>({
      path: DONATE_PAGE_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const page = flattenStrapiData(data);
    absolutizeUploadUrlsDeep(page);
    return page;
  } catch (err) {
    console.error("[getDonatePage]", err);
    return null;
  }
}
