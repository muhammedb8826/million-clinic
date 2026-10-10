import type { Metadata } from "next";
import { getProjects } from "@/lib/strapi";
import { ProjectCard } from "@/features/projects";
import { PageBanner, PageIntro } from "@/features/pages";
import { fetchSeoFallback, mergePageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_LIST_PAGE_SIZE, Pagination, parsePageParam } from "@/components/Pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const fb = await fetchSeoFallback({ revalidate: 60 });
  return mergePageMetadata(fb, {
    title: "Projects",
    description: "Explore our initiatives and the communities we support.",
  });
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);
  const { data: projects, meta } = await getProjects({
    page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
    revalidate: 60,
  });
  const pagination = meta?.pagination;
  const intro = "Explore our initiatives and the communities we support.";

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={null}
        title="Projects"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Projects" },
        ]}
        noBannerVariant="secondary"
      />
      <PageIntro text={intro} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {projects.length === 0 ? (
          <p className="text-muted-foreground">No projects yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
        <Pagination
          page={pagination?.page ?? page}
          pageCount={pagination?.pageCount ?? 1}
          basePath="/projects"
        />
      </div>
    </main>
  );
}
