import Image from "next/image";
import Link from "next/link";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiEvent } from "@/lib/strapi";

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

function badgeText(status: string | null | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (!s) return "";
  if (s === "upcoming") return "Upcoming";
  if (s === "ongoing") return "Ongoing";
  if (s === "past") return "Past";
  if (s === "cancelled") return "Cancelled";
  return status ?? "";
}

export function EventCard({ event }: { event: StrapiEvent }) {
  const cover = resolveStrapiMedia(event.cover) ?? event.cover;
  const coverUrl = cover?.url ? getStrapiMediaUrl(cover.url) : "";
  const dateStr = formatDateRange(event.startDate, event.endDate, event.timeZone ?? null);
  const status = badgeText(event.eventStatus ?? null);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/50 hover:shadow-lg"
    >
      {coverUrl && (
        <div className="relative aspect-16/10 overflow-hidden bg-muted">
          <Image
            src={coverUrl}
            alt={(cover as { alternativeText?: string | null })?.alternativeText ?? event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
            {event.category?.name && (
              <span className="inline-flex rounded-full bg-primary/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                {event.category.name}
              </span>
            )}
            {(event.isFeatured || status) && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {event.isFeatured && (
                  <span className="inline-flex rounded-full bg-tertiary px-2.5 py-1 text-[11px] font-semibold text-tertiary-foreground shadow-sm">
                    Featured
                  </span>
                )}
                {status && (
                  <span className="inline-flex rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                    {status}
                  </span>
                )}
              </div>
            )}
          </div>
          {dateStr && (
            <div className="absolute bottom-4 left-4 right-4 text-[11px] font-medium uppercase tracking-wide text-white/90">
              {dateStr}
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {!coverUrl && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {event.category?.name && (
              <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                {event.category.name}
              </span>
            )}
            {dateStr && (
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{dateStr}</span>
            )}
            {status && (
              <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {status}
              </span>
            )}
          </div>
        )}

        <h2 className="mb-2 line-clamp-2 text-xl font-extrabold tracking-tight text-foreground transition group-hover:text-primary">
          {event.title}
        </h2>
        {event.summary?.trim() && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {event.summary.trim()}
          </p>
        )}

        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3">
          View details
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

