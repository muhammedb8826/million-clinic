"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiAboutGalleryBlock, StrapiMedia } from "@/lib/strapi";

type GalleryItem = {
  id: number;
  url: string;
  alt: string;
  caption?: string | null;
};

function toGalleryItems(items: StrapiMedia[] | undefined, fallbackAlt: string): GalleryItem[] {
  const result: GalleryItem[] = [];
  for (const item of items ?? []) {
    const resolved = resolveStrapiMedia(item) ?? item;
    const url = resolved?.url ? getStrapiMediaUrl(resolved.url) : "";
    if (!url) continue;

    const altRaw = resolved?.alternativeText;
    const captionRaw = "caption" in resolved ? resolved.caption : undefined;
    const alt = typeof altRaw === "string" && altRaw.trim() ? altRaw.trim() : fallbackAlt;
    const caption = typeof captionRaw === "string" && captionRaw.trim() ? captionRaw.trim() : null;

    result.push({
      id: item.id,
      url,
      alt,
      caption,
    });
  }
  return result;
}

/** Varied bento spans for a modern asymmetric layout */
function tileClass(index: number, total: number): string {
  if (total === 1) return "col-span-2 row-span-2 sm:col-span-4 sm:row-span-2 aspect-16/10 sm:aspect-auto sm:min-h-[360px]";
  if (total === 2) return "col-span-2 aspect-4/3 sm:min-h-[280px]";
  if (total === 3) {
    if (index === 0) return "col-span-2 row-span-2 aspect-square sm:aspect-auto sm:min-h-[420px]";
    return "col-span-2 sm:col-span-2 aspect-4/3 sm:min-h-[200px]";
  }
  // 4+ — featured first tile, then flowing mosaic
  if (index === 0) return "col-span-2 row-span-2 aspect-square sm:aspect-auto sm:min-h-[420px]";
  if (index === 3 || index === 6) return "col-span-2 aspect-16/10 sm:min-h-[200px]";
  return "col-span-1 aspect-square sm:aspect-auto sm:min-h-[200px]";
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 9V4.5H8.25M15.75 4.5H20.25V9M20.25 15V19.5H15.75M8.25 19.5H3.75V15"
      />
    </svg>
  );
}

interface GallerySectionProps {
  block: StrapiAboutGalleryBlock;
}

export function GallerySection({ block }: GallerySectionProps) {
  // Stable across SSR/client — useId() can mismatch when tree identity differs.
  const titleId = `gallery-title-${block.id}`;
  const items = toGalleryItems(block.items, block.title?.trim() || "Gallery image");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex != null;
  const active = isOpen ? items[activeIndex] : null;

  const close = useCallback(() => setActiveIndex(null), []);
  const openAt = useCallback((index: number) => setActiveIndex(index), []);
  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i == null ? i : (i - 1 + items.length) % items.length));
  }, [items.length]);
  const goNext = useCallback(() => {
    setActiveIndex((i) => (i == null ? i : (i + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, goPrev, goNext]);

  if (!items.length && !block.title?.trim()) return null;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20" aria-labelledby={block.title ? titleId : undefined}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.97_0.02_65)_0%,transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.22_0.02_65)_0%,transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4">
        {(block.title?.trim() || items.length > 0) && (
          <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Gallery</p>
              {block.title?.trim() && (
                <h2 id={titleId} className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {block.title}
                </h2>
              )}
            </div>
            {items.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "photo" : "photos"}
              </p>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className="grid auto-rows-[minmax(140px,auto)] grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {items.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                type="button"
                onClick={() => openAt(index)}
                className={`group relative overflow-hidden rounded-2xl bg-muted text-left outline-none transition duration-500 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${tileClass(index, items.length)}`}
                aria-label={`View ${item.alt}`}
              >
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-0 transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="line-clamp-2 text-sm font-medium text-white drop-shadow">
                    {item.caption || item.alt}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                    <ExpandIcon />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isOpen && active && (
        <div
          className="fixed inset-0 z-100 flex flex-col bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery lightbox"
          onClick={close}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-4 text-white/90 sm:px-6">
            <p className="text-sm font-medium tabular-nums">
              {activeIndex! + 1} / {items.length}
            </p>
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
              aria-label="Close gallery"
            >
              Close
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8 sm:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
                  aria-label="Previous image"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
                  aria-label="Next image"
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            )}

            <div className="relative h-full max-h-[78vh] w-full max-w-5xl">
              <Image
                key={active.url}
                src={active.url}
                alt={active.alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {(active.caption || active.alt) && (
            <p className="mx-auto max-w-3xl px-4 pb-6 text-center text-sm text-white/75">
              {active.caption || active.alt}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
