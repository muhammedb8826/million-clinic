import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles, getAdjacentItems, getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiArticle } from "@/lib/strapi";
import { PageBanner, PageIntro } from "@/features/pages";
import { DynamicBlocks } from "@/features/blocks";
import { fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";
import { ArticleCard } from "@/features/articles";
import { AdjacentNav } from "@/components/AdjacentNav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

function RelatedArticleLink({ article }: { article: StrapiArticle }) {
  const dateStr = formatDate(article.publishedAt ?? article.createdAt);
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block rounded-xl border border-border bg-background p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <p className="font-semibold leading-snug text-foreground transition group-hover:text-primary">
        {article.title}
      </p>
      {dateStr && <p className="mt-1.5 text-xs text-muted-foreground">{dateStr}</p>}
    </Link>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [fb, article] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getArticleBySlug(slug, { revalidate: 60 }),
  ]);
  if (!article) {
    return mergePageMetadata(fb, { title: "Article Not Found" });
  }
  return mergePageMetadata(
    fb,
    strapiSeoToOverrides(article.seo, {
      title: article.title,
      description: article.summary ?? undefined,
    }),
  );
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, { revalidate: 60 });

  if (!article) notFound();

  const cover = resolveStrapiMedia(article.cover) ?? article.cover;
  const coverUrl = cover?.url ? getStrapiMediaUrl(cover.url) : "";
  const coverAlt =
    (cover as { alternativeText?: string | null })?.alternativeText?.trim() || article.title;
  const dateStr = formatDate(article.publishedAt ?? article.createdAt);

  let related: Awaited<ReturnType<typeof getArticles>>["data"] = [];
  if (article.category?.slug) {
    try {
      const response = await getArticles({
        category: article.category.slug,
        excludeSlug: article.slug,
        pageSize: 3,
        revalidate: 60,
      });
      related = response.data ?? [];
    } catch {
      related = [];
    }
  }

  const { older, newer } = await getAdjacentItems({
    path: "api/articles",
    createdAt: article.createdAt,
    excludeSlug: article.slug,
    revalidate: 60,
  });

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={null}
        title={article.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Articles", href: "/articles" },
          { label: article.title },
        ]}
        noBannerVariant="secondary"
      />
      <PageIntro text={article.summary ?? null} />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <article className="min-w-0">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {article.category && (
                <Link
                  href={`/articles?category=${article.category.slug}`}
                  className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  {article.category.name}
                </Link>
              )}
              {article.isFeatured && (
                <span className="inline-flex rounded-full bg-tertiary/20 px-3 py-1 text-xs font-semibold text-tertiary">
                  Featured
                </span>
              )}
              {dateStr && (
                <time
                  dateTime={article.publishedAt ?? article.createdAt}
                  className="text-sm text-muted-foreground"
                >
                  {dateStr}
                </time>
              )}
            </div>

            {coverUrl && (
              <figure className="mb-10 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                <div className="relative aspect-16/10 w-full">
                  <Image
                    src={coverUrl}
                    alt={coverAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 720px"
                    priority
                  />
                </div>
                {/* {(coverCaption || coverAlt !== article.title) && (
                  <figcaption className="border-t border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                    {coverCaption || coverAlt}
                  </figcaption>
                )} */}
              </figure>
            )}

            <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-28 prose-a:text-primary prose-img:rounded-xl">
              <DynamicBlocks blocks={article.blocks ?? []} />
            </div>

            <AdjacentNav
              previous={
                older
                  ? { href: `/articles/${older.slug}`, label: older.title }
                  : null
              }
              next={
                newer
                  ? { href: `/articles/${newer.slug}`, label: newer.title }
                  : null
              }
              previousCaption="Previous article"
              nextCaption="Next article"
            />
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Article info
                </h2>
                <dl className="mt-4 space-y-4 text-sm">
                  {dateStr && (
                    <div>
                      <dt className="font-semibold text-foreground">Published</dt>
                      <dd className="text-muted-foreground">{dateStr}</dd>
                    </div>
                  )}
                  {article.category && (
                    <div>
                      <dt className="font-semibold text-foreground">Category</dt>
                      <dd>
                        <Link
                          href={`/articles?category=${article.category.slug}`}
                          className="text-primary hover:underline"
                        >
                          {article.category.name}
                        </Link>
                      </dd>
                    </div>
                  )}
                </dl>
                <Link
                  href="/articles"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <span aria-hidden>←</span>
                  All articles
                </Link>
              </div>

              {related.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Related articles
                  </h2>
                  <div className="mt-4 space-y-3">
                    {related.map((a) => (
                      <RelatedArticleLink key={a.id} article={a} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-12 lg:hidden">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">More</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  Related articles
                </h2>
              </div>
              <Link href="/articles" className="text-sm font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
