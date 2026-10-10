"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiAboutTestimonialsBlock, StrapiMedia } from "@/lib/strapi";

type Testimonial = NonNullable<StrapiAboutTestimonialsBlock["testimonials"]>[number];

function mediaUrl(media: StrapiMedia | null | undefined): string {
  const resolved = resolveStrapiMedia(media) ?? media;
  return resolved?.url ? getStrapiMediaUrl(resolved.url) : "";
}

function mediaAlt(media: StrapiMedia | null | undefined, fallback = ""): string {
  const resolved = resolveStrapiMedia(media) ?? media;
  return (resolved as { alternativeText?: string | null } | null)?.alternativeText ?? fallback;
}

function StarRating({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < value ? "text-primary" : "text-border"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function QuoteMark() {
  return (
    <svg
      className="h-12 w-12 text-primary/25 sm:h-16 sm:w-16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7.17 6A5.17 5.17 0 002 11.17V18h6.83v-6.83H5.17A3.17 5.17 0 018.34 8.4L7.17 6zm9.66 0A5.17 5.17 0 0011.66 11.17V18H18.5v-6.83h-3.66a3.17 3.17 0 013.17-3.17L17 6.01 16.83 6z" />
    </svg>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
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

function TestimonialSlide({ testimonial }: { testimonial: Testimonial }) {
  const avatarUrl = mediaUrl(testimonial.avatar);
  const author = testimonial.author?.trim();
  const role = testimonial.role?.trim();
  const quote = testimonial.quote?.trim();

  return (
    <figure className="mx-auto flex min-h-[280px] w-full max-w-3xl flex-col items-center px-2 text-center sm:min-h-[300px]">
      <QuoteMark />
      {testimonial.rating ? (
        <div className="mt-4">
          <StarRating rating={testimonial.rating} />
        </div>
      ) : null}
      {quote && (
        <blockquote className="mt-6 text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl sm:leading-relaxed md:text-[1.65rem]">
          &ldquo;{quote}&rdquo;
        </blockquote>
      )}
      <figcaption className="mt-8 flex flex-col items-center gap-3">
        {avatarUrl ? (
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-muted ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <Image
              src={avatarUrl}
              alt={mediaAlt(testimonial.avatar, author ?? "Testimonial author")}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        ) : author ? (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary"
            aria-hidden
          >
            {author.charAt(0).toUpperCase()}
          </div>
        ) : null}
        <div>
          {author && <p className="font-semibold text-foreground">{author}</p>}
          {role && <p className="mt-0.5 text-sm text-muted-foreground">{role}</p>}
        </div>
      </figcaption>
    </figure>
  );
}

interface TestimonialsSectionProps {
  block: StrapiAboutTestimonialsBlock;
}

export function TestimonialsSection({ block }: TestimonialsSectionProps) {
  const testimonials = (block.testimonials ?? []).filter((t) => t.quote?.trim());
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: testimonials.length > 1, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (testimonials.length <= 1 || paused || !emblaApi) return;
    const t = window.setInterval(() => emblaApi.scrollNext(), 6000);
    return () => window.clearInterval(t);
  }, [testimonials.length, paused, emblaApi]);

  if (!testimonials.length && !block.title?.trim()) return null;

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20"
      aria-labelledby={block.title?.trim() ? `testimonials-title-${block.id}` : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.97_0.02_65)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,oklch(0.22_0.02_65)_0%,transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-64 w-64 rounded-full bg-secondary/5 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Testimonials</p>
          {block.title?.trim() && (
            <h2
              id={`testimonials-title-${block.id}`}
              className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {block.title}
            </h2>
          )}
        </div>

        {testimonials.length > 0 && (
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="min-w-0 shrink-0 grow-0 basis-full px-2 sm:px-6"
                    role="group"
                    aria-roledescription="slide"
                  >
                    <TestimonialSlide testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>

            {testimonials.length > 1 && (
              <>
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={scrollPrev}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary/40 hover:text-primary"
                    aria-label="Previous testimonial"
                  >
                    <Chevron direction="left" />
                  </button>
                  <div className="flex items-center gap-2 px-2">
                    {testimonials.map((t, index) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => scrollTo(index)}
                        aria-label={`Go to testimonial ${index + 1}`}
                        aria-current={index === selectedIndex ? "true" : undefined}
                        className={`h-2 rounded-full transition-all ${
                          index === selectedIndex
                            ? "w-8 bg-primary"
                            : "w-2 bg-border hover:bg-muted-foreground/40"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={scrollNext}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary/40 hover:text-primary"
                    aria-label="Next testimonial"
                  >
                    <Chevron direction="right" />
                  </button>
                </div>
                <p className="mt-4 text-center text-xs tabular-nums text-muted-foreground">
                  {selectedIndex + 1} / {testimonials.length}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
