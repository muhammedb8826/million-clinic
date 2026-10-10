import type { Metadata } from "next";
import { getEvents } from "@/lib/strapi/eventsApi";
import { PageBanner, PageIntro } from "@/features/pages";
import { EventCard } from "@/features/events";
import { fetchSeoFallback, mergePageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_LIST_PAGE_SIZE, Pagination, parsePageParam } from "@/components/Pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const fb = await fetchSeoFallback({ revalidate: 60 });
  return mergePageMetadata(fb, {
    title: "Events",
    description: "Explore upcoming and past events from our community.",
  });
}

export default async function EventsPage({ searchParams }: PageProps) {
  const { page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);
  const { data: events, meta } = await getEvents({
    revalidate: 60,
    page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
  });
  const pagination = meta?.pagination;
  const intro = "Explore upcoming and past events from our community.";

  return (
    <main className="min-h-screen">
      <PageBanner
        banner={null}
        title="Events"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Events" },
        ]}
        noBannerVariant="secondary"
      />
      <PageIntro text={intro} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {events.length === 0 ? (
          <p className="text-muted-foreground">No events yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
        <Pagination
          page={pagination?.page ?? page}
          pageCount={pagination?.pageCount ?? 1}
          basePath="/events"
        />
      </div>
    </main>
  );
}
