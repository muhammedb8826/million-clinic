import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStrapiMediaUrl, resolveStrapiMedia, getAdjacentItems } from "@/lib/strapi";
import { getEventBySlug, getRelatedEventsByCategory } from "@/lib/strapi/eventsApi";
import { PageBanner, PageIntro, RichTextContent } from "@/features/pages";
import { fetchSeoFallback, mergePageMetadata, strapiSeoToOverrides } from "@/lib/seo/metadata";
import { EventCard } from "@/features/events";
import { AdjacentNav } from "@/components/AdjacentNav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDateRange(startIso?: string | null, endIso?: string | null, tz?: string | null): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  try {
    if (startIso && endIso && startIso !== endIso) return `${fmt(startIso)} – ${fmt(endIso)}${tz ? ` · ${tz}` : ""}`;
    if (startIso) return `${fmt(startIso)}${tz ? ` · ${tz}` : ""}`;
    return "";
  } catch {
    return "";
  }
}

function statusBadge(status: string | null | undefined) {
  const s = (status ?? "").toLowerCase();
  if (!s) return null;
  const label =
    s === "upcoming" ? "Upcoming" :
    s === "ongoing" ? "Ongoing" :
    s === "past" ? "Past" :
    s === "cancelled" ? "Cancelled" :
    status ?? "";
  return (
    <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
      {label}
    </span>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [fb, event] = await Promise.all([
    fetchSeoFallback({ revalidate: 60 }),
    getEventBySlug(slug, { revalidate: 60 }),
  ]);
  if (!event) return mergePageMetadata(fb, { title: "Event Not Found" });

  return mergePageMetadata(
    fb,
    strapiSeoToOverrides(event.seo, { title: event.title, description: event.summary ?? undefined }),
  );
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug, { revalidate: 60 });
  if (!event) notFound();

  const dateStr = formatDateRange(event.startDate, event.endDate, event.timeZone ?? null);
  const cover = resolveStrapiMedia(event.cover) ?? event.cover;
  const coverUrl = cover?.url ? getStrapiMediaUrl(cover.url) : "";

  const categorySlug = event.category?.slug;
  const related = categorySlug
    ? await getRelatedEventsByCategory({ categorySlug, excludeSlug: event.slug, pageSize: 3, revalidate: 60 })
    : [];

  const { older, newer } = await getAdjacentItems({
    path: "api/events",
    createdAt: event.createdAt,
    excludeSlug: event.slug,
    dateField: event.startDate ? "startDate" : "createdAt",
    dateValue: event.startDate ?? event.createdAt,
    revalidate: 60,
  });

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={event.cover ?? null}
        title={event.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
        noBannerVariant="secondary"
      />
      <PageIntro text={event.summary ?? null} />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <article className="min-w-0">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {event.category?.slug && (
                <Link
                  href={`/events?category=${event.category.slug}`}
                  className="rounded bg-primary/15 px-2 py-0.5 text-sm text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  {event.category.name}
                </Link>
              )}
              {event.isFeatured && (
                <span className="rounded bg-tertiary/20 px-2 py-0.5 text-xs font-medium text-tertiary">
                  Featured
                </span>
              )}
              {statusBadge(event.eventStatus ?? null)}
              {dateStr && (
                <span className="text-sm text-muted-foreground">{dateStr}</span>
              )}
            </div>

            {coverUrl && (
              <div className="relative mb-8 aspect-16/10 w-full overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={coverUrl}
                  alt={(cover as { alternativeText?: string | null })?.alternativeText ?? event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 700px"
                />
              </div>
            )}

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <RichTextContent content={event.description ?? null} />
            </div>

            {event.speakers && event.speakers.length > 0 && (
              <section className="mt-12">
                <h2 className="text-xl font-semibold text-foreground">Speakers</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {event.speakers.map((sp) => {
                    const photo = resolveStrapiMedia(sp.photo) ?? sp.photo;
                    const photoUrl = photo?.url ? getStrapiMediaUrl(photo.url) : "";
                    return (
                      <div key={sp.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                          {photoUrl ? (
                            <Image
                              src={photoUrl}
                              alt={(photo as { alternativeText?: string | null })?.alternativeText ?? sp.name}
                              width={56}
                              height={56}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-full bg-muted" aria-hidden />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{sp.name}</p>
                            {sp.role && <p className="text-sm text-muted-foreground">{sp.role}</p>}
                          </div>
                        </div>
                        {sp.bio && <p className="mt-4 text-sm text-muted-foreground">{sp.bio}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {(event.location || event.organizer) && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Event info
                  </h3>
                  <div className="mt-4 space-y-4 text-sm">
                    {event.location && (
                      <div>
                        <p className="font-semibold text-foreground">Location</p>
                        <p className="text-muted-foreground">
                          {[event.location.street, event.location.city, event.location.country].filter(Boolean).join(", ")}
                        </p>
                        {event.location.phone && (
                          <p className="mt-1 text-muted-foreground">{event.location.phone}</p>
                        )}
                      </div>
                    )}
                    {event.organizer && (
                      <div>
                        <p className="font-semibold text-foreground">Organizer</p>
                        <p className="text-muted-foreground">{event.organizer.fullName}</p>
                        {event.organizer.role && <p className="text-muted-foreground">{event.organizer.role}</p>}
                        {event.organizer.email && (
                          <a className="mt-2 block text-primary hover:underline" href={`mailto:${event.organizer.email}`}>
                            {event.organizer.email}
                          </a>
                        )}
                        {event.organizer.phone && (
                          <a className="block text-primary hover:underline" href={`tel:${event.organizer.phone}`}>
                            {event.organizer.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Related events
                  </h3>
                  <div className="mt-4 space-y-4">
                    {related.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/events" className="text-sm font-medium text-primary hover:underline">
                      View all
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <AdjacentNav
          previous={
            older ? { href: `/events/${older.slug}`, label: older.title } : null
          }
          next={
            newer ? { href: `/events/${newer.slug}`, label: newer.title } : null
          }
          previousCaption="Previous event"
          nextCaption="Next event"
        />
      </div>
    </main>
  );
}

