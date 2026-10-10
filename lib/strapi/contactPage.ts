import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiContactPage } from "./types";

const CONTACT_PAGE_PATH = "api/contact";

/** Flatten Strapi v4 response (attributes wrapper) to direct fields */
function flattenStrapiData(raw: unknown): StrapiContactPage {
  const data = raw as Record<string, unknown>;
  if (!data) return {} as unknown as StrapiContactPage;
  if (data.attributes && typeof data.attributes === "object") {
    const { attributes, ...rest } = data;
    return { ...rest, ...(attributes as Record<string, unknown>) } as unknown as StrapiContactPage;
  }
  return data as unknown as StrapiContactPage;
}

/**
 * Fetches the contact page single type with banner, SEO, and address populated.
 */
export async function getContactPage(options?: {
  revalidate?: number | false;
}): Promise<StrapiContactPage | null> {
  try {
    const searchParams: Record<string, unknown> = {
      populate: {
        banner: { populate: "*" },
        seo: { populate: "*" },
        address: { populate: "*" },
        socialLinks: { populate: "*" },
      },
    };
    const { data } = await strapiFetch<StrapiContactPage>({
      path: CONTACT_PAGE_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const page = flattenStrapiData(data);
    absolutizeUploadUrlsDeep(page);
    return page;
  } catch (err) {
    console.error("[getContactPage]", err);
    return null;
  }
}
