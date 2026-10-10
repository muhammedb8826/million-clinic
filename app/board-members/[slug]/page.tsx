import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBoardMemberBySlug, getAdjacentItems } from "@/lib/strapi";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import { PageBanner, RichTextContent } from "@/features/pages";
import { bannerFieldToOgUrl, fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";
import { AdjacentNav } from "@/components/AdjacentNav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function ensureUrl(url: string | null | undefined): string {
  if (url == null || typeof url !== "string" || !url.trim()) return "#";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return trimmed;
  if (trimmed === "telegram") return "#";
  return `https://${trimmed}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [fb, member] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getBoardMemberBySlug(slug, { revalidate: 60 }),
  ]);
  if (!member) {
    return mergePageMetadata(fb, { title: "Board Member Not Found" });
  }
  return mergePageMetadata(fb, {
    ...strapiSeoToOverrides(undefined, {
      title: member.fullName,
      description: member.role ?? member.message ?? undefined,
    }),
    ogImage: bannerFieldToOgUrl(member.photo),
  });
}

export default async function BoardMemberPage({ params }: PageProps) {
  const { slug } = await params;
  const member = await getBoardMemberBySlug(slug, { revalidate: 60 });

  if (!member) notFound();

  const photo = resolveStrapiMedia(member.photo) ?? member.photo;
  const photoUrl = photo?.url ? getStrapiMediaUrl(photo.url) : "";
  const displayTitle = [member.title, member.fullName].filter(Boolean).join(" ");

  const { older, newer } = await getAdjacentItems({
    path: "api/board-members",
    createdAt: member.createdAt,
    excludeSlug: member.slug,
    titleField: "fullName",
    revalidate: 60,
  });

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={null}
        title={displayTitle || member.fullName}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Board Members", href: "/board-members" },
          { label: member.fullName },
        ]}
        noBannerVariant="secondary"
      />
      <article className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
          <div className="shrink-0">
            {photoUrl ? (
              <div className="relative aspect-3/4 w-full max-w-[280px] overflow-hidden rounded-xl bg-muted">
                <Image
                  src={photoUrl}
                  alt={(photo as { alternativeText?: string })?.alternativeText ?? member.fullName}
                  fill
                  className="object-cover"
                  sizes="280px"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-3/4 w-full max-w-[280px] items-center justify-center rounded-xl bg-muted text-6xl font-semibold text-muted-foreground">
                {member.fullName.charAt(0)}
              </div>
            )}
            {member.socialLinks && member.socialLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {member.socialLinks.map((item) => (
                  <a
                    key={item.id}
                    href={ensureUrl(item.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary transition hover:bg-primary hover:text-primary-foreground"
                    aria-label={item.icon?.iconName ?? "Social link"}
                  >
                    {item.icon?.iconData && (
                      <svg
                        width={item.icon.width ?? 20}
                        height={item.icon.height ?? 20}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="shrink-0"
                        dangerouslySetInnerHTML={{ __html: item.icon.iconData }}
                      />
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            {member.role && (
              <p className="text-lg font-medium text-primary">{member.role}</p>
            )}
            {(member.email || member.phone) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {member.email && (
                  <a href={`mailto:${member.email}`} className="hover:text-primary">
                    {member.email}
                  </a>
                )}
                {member.email && member.phone && " · "}
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="hover:text-primary">
                    {member.phone}
                  </a>
                )}
              </p>
            )}
            {member.message && (
              <blockquote className="mt-6 border-l-4 border-primary bg-muted/50 py-4 pl-6 pr-6 text-muted-foreground italic">
                {member.message}
              </blockquote>
            )}
            {member.bio && member.bio.length > 0 && (
              <div className="mt-8">
                <RichTextContent content={member.bio} />
              </div>
            )}
          </div>
        </div>
        <AdjacentNav
          previous={
            older ? { href: `/board-members/${older.slug}`, label: older.title } : null
          }
          next={
            newer ? { href: `/board-members/${newer.slug}`, label: newer.title } : null
          }
          previousCaption="Previous member"
          nextCaption="Next member"
        />
      </article>
    </main>
  );
}
