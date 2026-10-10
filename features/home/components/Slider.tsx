"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiSlide } from "@/lib/strapi";

function linkHref(link: { url?: string | null; isExternal?: boolean } | null): string {
  const url = link?.url;
  if (url == null || url === "") return "/";
  if (link?.isExternal) return url;
  return typeof url === "string" && url.startsWith("/") ? url : `/${url}`;
}

interface SliderProps {
  slides: StrapiSlide[];
}

export function Slider({ slides: rawSlides }: SliderProps) {
  const slides = useMemo(
    () => rawSlides.filter((s) => s?.media?.url || resolveStrapiMedia(s.media)?.url),
    [rawSlides]
  );
  const slidesKey = slides.map((s) => s.id).join("-");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [firstMediaReady, setFirstMediaReady] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  /** Embla often measures 0-width on first paint (layout/fonts/images). Re-init fixes blank carousel until reload. */
  useLayoutEffect(() => {
    if (!emblaApi || slides.length === 0) return;
    const reInit = () => {
      emblaApi.reInit();
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    reInit();
    const raf = requestAnimationFrame(() => reInit());
    const t = window.setTimeout(reInit, 100);
    window.addEventListener("resize", reInit);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("resize", reInit);
    };
  }, [emblaApi, slidesKey, slides.length]);

  useEffect(() => {
    if (!emblaApi || slides.length === 0) return;
    // When the first slide media finishes loading, re-measure again.
    if (!firstMediaReady) return;
    emblaApi.reInit();
    const raf = requestAnimationFrame(() => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
    return () => cancelAnimationFrame(raf);
  }, [emblaApi, firstMediaReady, slides.length]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (slides.length <= 1 || paused || !emblaApi) return;
    const t = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(t);
  }, [slides.length, paused, emblaApi]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative h-[min(calc(100vw*9/16),calc(100svh-115px))] min-h-[280px] w-full overflow-hidden bg-secondary sm:min-h-[360px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero slider"
    >
      <div className="h-full min-h-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full min-h-0 touch-pan-y gap-0">
          {slides.map((slide) => {
            const media = resolveStrapiMedia(slide.media) ?? (slide.media as { url?: string; mime?: string; alternativeText?: string | null });
            const mediaUrl = media?.url ? getStrapiMediaUrl(media.url) : "";
            const mime = (media as { mime?: string })?.mime;
            const isVideo = typeof mime === "string" && mime.startsWith("video/");
            const isFirst = slide.id === slides[0]?.id;
            const link = slide.link;
            const heading = slide.heading;
            const subHeading = slide.subHeading;

            return (
              <div
                key={slide.id}
                className="relative h-full min-h-0 min-w-0 flex-[0_0_100%]"
                role="group"
                aria-roledescription="slide"
              >
                <div className="relative h-full w-full min-h-0">
                  {isVideo ? (
                    <video
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      src={mediaUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onLoadedData={() => {
                        if (isFirst) setFirstMediaReady(true);
                      }}
                      aria-hidden
                    />
                  ) : mediaUrl ? (
                    <Image
                      src={mediaUrl}
                      alt={media?.alternativeText ?? heading ?? "Slide"}
                      fill
                      className={`object-cover object-center transition-opacity duration-300 ${
                        isFirst && !firstMediaReady ? "opacity-0" : "opacity-100"
                      }`}
                      priority={slide.id === slides[0]?.id}
                      sizes="100vw"
                      onLoadingComplete={() => {
                        if (isFirst) setFirstMediaReady(true);
                      }}
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-black/40" aria-hidden />

                  {(heading || subHeading || link) && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-12 py-6 text-center text-white sm:px-16 sm:py-8">
                      <div className="pointer-events-auto mx-auto flex w-full max-w-6xl flex-col items-center gap-4 sm:gap-5">
                        {heading && (
                          <h2 className="max-w-5xl text-balance text-xl font-bold leading-tight drop-shadow-md sm:text-3xl md:text-4xl lg:text-5xl">
                            {heading}
                          </h2>
                        )}
                        {subHeading && (
                          <p className="max-w-4xl text-balance text-sm leading-relaxed drop-shadow sm:text-lg md:text-xl">
                            {subHeading}
                          </p>
                        )}
                        {link && (
                          <div className="mt-1 sm:mt-2">
                            {link.isExternal ? (
                              <a
                                href={linkHref(link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                              >
                                {link.title}
                              </a>
                            ) : (
                              <Link
                                href={linkHref(link)}
                                className="inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                              >
                                {link.title}
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/80 md:left-4"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/80 md:right-4"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
            role="tablist"
            aria-label="Slide navigation"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === selectedIndex}
                aria-label={`Slide ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === selectedIndex ? "w-8 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
