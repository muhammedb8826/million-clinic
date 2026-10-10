import { absolutizeUploadUrlsDeep } from "./absolutizeStrapiMedia";
import { strapiFetch } from "./fetcher";
import type { StrapiProject } from "./types";
import { dynamicBlocksPopulate } from "./dynamicBlocksPopulate";

const PROJECTS_PATH = "api/projects";

export interface ProjectsResponse {
  data: StrapiProject[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Fetches projects with cover, blocks, and slides populated.
 */
export async function getProjects(options?: {
  page?: number;
  pageSize?: number;
  featured?: boolean;
  revalidate?: number | false;
}): Promise<ProjectsResponse> {
  const searchParams: Record<string, unknown> = {
    populate: {
      banner: { populate: "*" },
      seo: { populate: "*" },
      blocks: dynamicBlocksPopulate(),
    },
    sort: ["createdAt:desc"],
  };
  if (options?.page != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.page != null) (searchParams.pagination as Record<string, unknown>)["page"] = options.page;
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown> | undefined) ??= {};
  if (options?.pageSize != null) (searchParams.pagination as Record<string, unknown>)["pageSize"] = options.pageSize;
  if (options?.featured !== undefined) {
    searchParams.filters = { ...(searchParams.filters as Record<string, unknown>), isFeatured: { $eq: options.featured } };
  }

  const { data, meta } = await strapiFetch<StrapiProject[]>({
    path: PROJECTS_PATH,
    searchParams,
    next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
  });

  const list = Array.isArray(data) ? data : [];
  list.forEach(absolutizeUploadUrlsDeep);
  return { data: list, meta: meta as ProjectsResponse["meta"] };
}

/**
 * Fetches a single project by slug.
 */
export async function getProjectBySlug(
  slug: string,
  options?: { revalidate?: number | false }
): Promise<StrapiProject | null> {
  try {
    const searchParams: Record<string, unknown> = {
      filters: { slug: { $eq: slug } },
      populate: {
        banner: { populate: "*" },
        seo: { populate: "*" },
        blocks: dynamicBlocksPopulate(),
      },
    };
    const { data } = await strapiFetch<StrapiProject[]>({
      path: PROJECTS_PATH,
      searchParams,
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
    const projects = Array.isArray(data) ? data : [];
    const project = projects[0] ?? null;
    if (project) absolutizeUploadUrlsDeep(project);
    return project;
  } catch (err) {
    console.error("[getProjectBySlug]", err);
    return null;
  }
}
