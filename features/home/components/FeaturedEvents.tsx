import Link from "next/link";
import { EventCard } from "@/features/events";
import type { StrapiEvent } from "@/lib/strapi";

export function FeaturedEvents({ events }: { events: StrapiEvent[] }) {
  if (!events?.length) return null;

  const display = events.slice(0, 3);

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              Community
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]">
              Upcoming Events
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Join us at our upcoming events and community gatherings.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
          {display.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            View all events
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

