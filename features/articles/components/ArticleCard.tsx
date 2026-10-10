import Image from "next/image";
import Link from "next/link";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiArticle } from "@/lib/strapi";

interface ArticleCardProps {
  article: StrapiArticle;
  /** Larger card for hero/featured slot on homepage */
  variant?: "default" | "featured";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getArticleImage(article: StrapiArticle): { url: string; alt: string } | null {
  const cover = resolveStrapiMedia(article.cover) ?? article.cover;
  if (cover?.url) {
    const url = getStrapiMediaUrl(cover.url);
    if (url) return { url, alt: (cover as { alternativeText?: string })?.alternativeText ?? article.title };
  }
  for (const block of article.blocks ?? []) {
    if (block.__component === "shared.media" && "file" in block && block.file) {
      const file = resolveStrapiMedia(block.file) ?? block.file;
      const mime = (file as { mime?: string })?.mime;
      if (typeof mime === "string" && mime.startsWith("image/")) {
        const url = file?.url ? getStrapiMediaUrl(file.url) : "";
        if (url) return { url, alt: (file as { alternativeText?: string })?.alternativeText ?? article.title };
      }
    }
    if (block.__component === "shared.slider" && "media" in block && block.media) {
      const media = resolveStrapiMedia(block.media) ?? block.media;
      const url = media?.url ? getStrapiMediaUrl(media.url) : "";
      if (url) return { url, alt: article.title };
    }
  }
  const firstSlide = article.slides?.[0];
  const slideMedia = firstSlide?.media ? resolveStrapiMedia(firstSlide.media) ?? firstSlide.media : null;
  if (slideMedia?.url) {
    const url = getStrapiMediaUrl(slideMedia.url);
    if (url) return { url, alt: (slideMedia as { alternativeText?: string })?.alternativeText ?? article.title };
  }
  return null;
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const image = getArticleImage(article);
  const summary = article.summary?.trim();
  const excerptLength = variant === "featured" ? 160 : 100;
  const excerpt = summary
    ? summary.length > excerptLength
      ? `${summary.slice(0, excerptLength)}…`
      : summary
    : "";
  const category = article.category;
  const dateStr = formatDate(article.publishedAt ?? article.createdAt);
  const isFeatured = variant === "featured";

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={`group block h-full overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg ${
        isFeatured ? "rounded-2xl" : "rounded-2xl"
      }`}
    >
      {image ? (
        <div className="relative aspect-16/10 overflow-hidden bg-muted">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes={isFeatured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 33vw, 25vw"}
            priority={isFeatured}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
            {category && (
              <span className="inline-flex rounded-full bg-primary/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                {category.name}
              </span>
            )}
            {article.isFeatured && (
              <span className="inline-flex rounded-full bg-tertiary px-2.5 py-1 text-[11px] font-semibold text-tertiary-foreground shadow-sm">
                Featured
              </span>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/90">
            {dateStr && <span>{dateStr}</span>}
          </div>
        </div>
      ) : null}
      <div className="flex h-full flex-col p-5">
        {!image && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {category && (
              <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                {category.name}
              </span>
            )}
            {dateStr && (
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {dateStr}
              </span>
            )}
            {article.isFeatured && (
              <span className="inline-flex rounded-full bg-tertiary/20 px-2.5 py-0.5 text-[11px] font-semibold text-tertiary">
                Featured
              </span>
            )}
          </div>
        )}
        <h2
          className={`font-extrabold tracking-tight text-foreground transition group-hover:text-primary ${
            isFeatured ? "mb-3 text-2xl sm:text-3xl" : "mb-3 text-xl sm:text-[1.35rem]"
          }`}
        >
          {article.title}
        </h2>
        {excerpt && (
          <p
            className={`text-muted-foreground ${
              isFeatured ? "line-clamp-3 text-sm sm:text-base" : "line-clamp-3 text-sm"
            }`}
          >
            {excerpt}
          </p>
        )}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3">
          Read more
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
