import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiGlobal } from "./types";

const GLOBAL_PATH = "api/global";

/**
 * Fetches global site data from Strapi with topHeader, header, and footer populated.
 */
export async function getGlobal(options?: {
  revalidate?: number | false;
}): Promise<StrapiGlobal> {
  const searchParams: Record<string, unknown> = {
    populate: {
      topHeader: { populate: "*" },
      defaultSeo: { populate: "*" },
      header: {
        populate: {
          logo: { populate: "*" },
          darkLogo: { populate: "*" },
          menu: { populate: "*" },
          subMenu: { populate: "*" },
          button: { populate: "*" },
        },
      },
      footer: {
        populate: {
          logo: { populate: "*" },
          darkLogo: { populate: "*" },
          columns: { populate: "*" },
          socialLinks: { populate: "*" },
          bottomLinks: { populate: "*" },
        },
      },
    },
  };

  const { data } = await strapiFetch<StrapiGlobal>({
    path: GLOBAL_PATH,
    searchParams,
    next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
  });

  if (data && typeof data === "object") absolutizeUploadUrlsDeep(data);
  return data;
}
