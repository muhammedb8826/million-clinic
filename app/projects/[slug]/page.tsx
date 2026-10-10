import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getAdjacentItems } from "@/lib/strapi";
import { Slider } from "@/features/home";
import { PageBanner } from "@/features/pages";
import { DynamicBlocks } from "@/features/blocks";
import { fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";
import { AdjacentNav } from "@/components/AdjacentNav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [fb, project] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getProjectBySlug(slug, { revalidate: 60 }),
  ]);
  if (!project) {
    return mergePageMetadata(fb, { title: "Project Not Found" });
  }
  return mergePageMetadata(
    fb,
    strapiSeoToOverrides(project.seo, { title: project.title, description: project.summary ?? undefined }),
  );
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, { revalidate: 60 });

  if (!project) notFound();

  const { title, cover, banner, summary, blocks, slides } = project;
  const bannerMedia = cover ?? banner;

  const { older, newer } = await getAdjacentItems({
    path: "api/projects",
    createdAt: project.createdAt,
    excludeSlug: project.slug,
    revalidate: 60,
  });

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={bannerMedia}
        title={title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: title },
        ]}
        noBannerVariant="secondary"
      />
      {slides && slides.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="overflow-hidden rounded-xl">
            <Slider slides={slides} />
          </div>
        </div>
      )}
      <article className="mx-auto max-w-3xl px-4 py-12">
        {project.isFeatured && (
          <span className="mb-6 inline-block rounded bg-tertiary/20 px-2 py-0.5 text-xs font-medium text-tertiary">
            Featured
          </span>
        )}
        {summary?.trim() && (
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            {summary.trim()}
          </p>
        )}
        <DynamicBlocks blocks={blocks ?? []} />
        <AdjacentNav
          previous={
            older ? { href: `/projects/${older.slug}`, label: older.title } : null
          }
          next={
            newer ? { href: `/projects/${newer.slug}`, label: newer.title } : null
          }
          previousCaption="Previous project"
          nextCaption="Next project"
        />
      </article>
    </main>
  );
}
