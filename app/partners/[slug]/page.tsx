import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPartnerBySlug, getAdjacentItems, getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import { fetchSeoFallback, mergePageMetadata } from "@/lib/seo/metadata";
import { RichTextContent } from "@/features/pages";
import type { StrapiRichTextNode } from "@/lib/strapi";
import { AdjacentNav } from "@/components/AdjacentNav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function ensureUrl(url: string | null | undefined): string {
  if (url == null || typeof url !== "string" || !url.trim()) return "#";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [fb, partner] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getPartnerBySlug(slug, { revalidate: 60 }),
  ]);
  if (!partner) return mergePageMetadata(fb, { title: "Partner Not Found" });

  const logo = resolveStrapiMedia(partner.logo) ?? partner.logo;
  const logoUrl = logo?.url ? getStrapiMediaUrl(logo.url) : undefined;

  const description =
    typeof partner.description === "string"
      ? partner.description
      : undefined;

  return mergePageMetadata(fb, {
    title: partner.name,
    description,
    ogImage: logoUrl,
  });
}

export default async function PartnerDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug, { revalidate: 60 });
  if (!partner) notFound();

  const logo = resolveStrapiMedia(partner.logo) ?? partner.logo;
  const logoUrl = logo?.url ? getStrapiMediaUrl(logo.url) : "";
  const website = partner.website?.trim() || "";
  const descriptionNodes: StrapiRichTextNode[] | null =
    Array.isArray(partner.description)
      ? (partner.description as StrapiRichTextNode[])
      : partner.description && typeof partner.description === "object"
        ? ([partner.description] as unknown as StrapiRichTextNode[])
        : null;

  const { older, newer } = await getAdjacentItems({
    path: "api/partners",
    createdAt: partner.createdAt,
    excludeSlug: partner.slug,
    titleField: "name",
    revalidate: 60,
  });

  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-muted/30 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Home
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link href="/partners" className="text-sm text-muted-foreground hover:text-primary">
              Partners
            </Link>
          </div>

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {logoUrl ? (
              <div className="relative h-20 w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card p-4">
                <Image
                  src={logoUrl}
                  alt={(logo as { alternativeText?: string | null })?.alternativeText ?? partner.name}
                  fill
                  className="object-contain"
                  sizes="240px"
                  priority
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {partner.name}
              </h1>
              {website && website !== "#" && (
                <a
                  href={ensureUrl(website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Visit website
                  <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          {typeof partner.description === "string" && partner.description.trim() ? (
            <p className="text-lg leading-relaxed text-muted-foreground">{partner.description}</p>
          ) : descriptionNodes && descriptionNodes.length > 0 ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <RichTextContent content={descriptionNodes} />
            </div>
          ) : (
            <p className="text-muted-foreground">No description available for this partner yet.</p>
          )}
          <AdjacentNav
            previous={
              older ? { href: `/partners/${older.slug}`, label: older.title } : null
            }
            next={
              newer ? { href: `/partners/${newer.slug}`, label: newer.title } : null
            }
            previousCaption="Previous partner"
            nextCaption="Next partner"
          />
        </div>
      </section>
    </main>
  );
}

