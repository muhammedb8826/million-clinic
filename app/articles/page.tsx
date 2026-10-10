import type { Metadata } from "next";
import { getArticles } from "@/lib/strapi";
import { ArticleCard } from "@/features/articles";
import { PageBanner, PageIntro } from "@/features/pages";
import { fetchSeoFallback, mergePageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_LIST_PAGE_SIZE, Pagination, parsePageParam } from "@/components/Pagination";

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

function formatCategoryLabel(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { category } = await searchParams;
  const fb = await fetchSeoFallback({ revalidate: 60 });
  const title = category ? `Articles: ${formatCategoryLabel(category)}` : "Articles";
  const description = category
    ? "Stories and updates in this category."
    : "Stories and updates from our work around the world.";
  return mergePageMetadata(fb, { title, description });
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { category, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);
  const { data: articles, meta } = await getArticles({
    category,
    page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
    revalidate: 60,
  });

  const pagination = meta?.pagination;
  const pageCount = pagination?.pageCount ?? 1;
  const currentPage = pagination?.page ?? page;

  const title = category ? `Articles: ${formatCategoryLabel(category)}` : "Articles";
  const subTitle = category
    ? "Stories and updates in this category."
    : "Stories and updates from our work around the world.";
  const breadcrumb = [
    { label: "Home", href: "/" },
    { label: "Articles", href: category ? "/articles" : undefined },
    ...(category ? [{ label: formatCategoryLabel(category), href: undefined }] : []),
  ];

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={null}
        title={title}
        breadcrumb={breadcrumb}
        noBannerVariant="secondary"
      />
      <PageIntro text={subTitle} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {articles.length === 0 ? (
          <p className="text-muted-foreground">No articles yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          basePath="/articles"
          query={{ category }}
        />
      </div>
    </main>
  );
}
