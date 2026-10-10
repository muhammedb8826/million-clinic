import Image from "next/image";
import Link from "next/link";
import { Slider } from "@/features/home";
import { RichTextContent } from "@/features/pages";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type {
  StrapiAboutBlock,
  StrapiAboutAccordionsBlock,
  StrapiAboutCardsBlock,
  StrapiAboutContentBlock,
  StrapiAboutCtaBlock,
  StrapiAboutFeaturesBlock,
  StrapiAboutMediaBlock,
  StrapiAboutStatsBlock,
  StrapiAboutVideoSectionBlock,
  StrapiLink,
  StrapiMedia,
} from "@/lib/strapi";
import { AboutOrganization } from "./AboutOrganization";
import { GallerySection } from "./GallerySection";
import { TestimonialsSection } from "./TestimonialsSection";
import { TabSection } from "./TabSection";

function mediaUrl(media: StrapiMedia | null | undefined): string {
  const resolved = resolveStrapiMedia(media) ?? media;
  return resolved?.url ? getStrapiMediaUrl(resolved.url) : "";
}

function mediaAlt(media: StrapiMedia | null | undefined, fallback = ""): string {
  const resolved = resolveStrapiMedia(media) ?? media;
  return (resolved as { alternativeText?: string | null } | null)?.alternativeText ?? fallback;
}

function linkHref(link: StrapiLink | null | undefined): string | null {
  const url = link?.url?.trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return `/${url}`;
}

function LinkButton({ link }: { link: StrapiLink | null | undefined }) {
  const href = linkHref(link);
  const title = link?.title?.trim();
  if (!href || !title) return null;

  const className =
    "inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90";

  if (link?.isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {title}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {title}
    </Link>
  );
}

function IconSvg({ icon }: { icon: { iconData?: string; width?: number; height?: number } | null | undefined }) {
  if (!icon?.iconData) return null;
  const w = icon.width ?? 24;
  const h = icon.height ?? 24;
  return (
    <svg
      width={24}
      height={24}
      viewBox={`0 0 ${w} ${h}`}
      fill="currentColor"
      className="shrink-0"
      dangerouslySetInnerHTML={{ __html: icon.iconData }}
    />
  );
}

function SectionHeading({ title, subTitle }: { title?: string | null; subTitle?: string | null }) {
  if (!title?.trim() && !subTitle?.trim()) return null;
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {subTitle && (
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {subTitle}
        </p>
      )}
      {title && (
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
      )}
    </div>
  );
}

function ContentBlock({ block }: { block: StrapiAboutContentBlock }) {
  const url = mediaUrl(block.image);
  const imageFirst = block.imagePosition !== "right";

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          {url && imageFirst && <ContentImage block={block} url={url} />}
          <div className={url && !imageFirst ? "md:order-first" : ""}>
            {block.subTitle && (
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                {block.subTitle}
              </p>
            )}
            {block.title && (
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {block.title}
              </h2>
            )}
            <RichTextContent content={block.content} className="mt-5" />
            {block.link && (
              <div className="mt-6">
                <LinkButton link={block.link} />
              </div>
            )}
          </div>
          {url && !imageFirst && <ContentImage block={block} url={url} />}
        </div>
      </div>
    </section>
  );
}

function ContentImage({ block, url }: { block: StrapiAboutContentBlock; url: string }) {
  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
      <Image
        src={url}
        alt={mediaAlt(block.image, block.title ?? "About")}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

function StatsBlock({ block }: { block: StrapiAboutStatsBlock }) {
  const stats = block.stats ?? [];
  if (!stats.length) return null;

  return (
    <section className="py-12">
      <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.id} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <p className="text-4xl font-bold text-primary">
              {stat.number}
              {stat.suffix}
            </p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBlock({ block }: { block: StrapiAboutCtaBlock }) {
  const bgUrl = mediaUrl(block.backgroundImage);
  if (!block.title && !block.description && !linkHref(block.link)) return null;

  return (
    <section className="relative overflow-hidden bg-primary px-4 py-16 text-center text-primary-foreground">
      {bgUrl && (
        <Image
          src={bgUrl}
          alt=""
          fill
          className="object-cover opacity-15"
          sizes="100vw"
        />
      )}
      <div className="relative mx-auto max-w-3xl">
        {block.title && <h2 className="text-3xl font-bold sm:text-4xl">{block.title}</h2>}
        {block.description && <p className="mt-4 text-primary-foreground/85">{block.description}</p>}
        <div className="mt-8 flex justify-center">
          <LinkButton link={block.link} />
          </div>
      </div>
    </section>
  );
}

function FeaturesBlock({ block }: { block: StrapiAboutFeaturesBlock }) {
  const features = block.features ?? [];
  if (!features.length && !block.title && !block.subTitle) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title={block.title} subTitle={block.subTitle} />
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {feature.icon && (
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <IconSvg icon={feature.icon} />
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              {feature.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              )}
              <div className="mt-5">
                <LinkButton link={feature.link} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccordionsBlock({ block }: { block: StrapiAboutAccordionsBlock }) {
  const items = block.items ?? [];
  if (!items.length && !block.title) return null;

  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeading title={block.title} />
        <div className="space-y-3">
          {items.map((item) => (
            <details key={item.id} className="group rounded-xl border border-border bg-card p-5">
              <summary className="cursor-pointer font-semibold text-foreground marker:text-primary">
                {item.question}
              </summary>
              <RichTextContent content={item.answer} className="mt-4" />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const watchMatch = url.match(/(?:v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return watchMatch?.[1] ?? null;
}

function getVimeoVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

function VideoSectionBlock({ block }: { block: StrapiAboutVideoSectionBlock }) {
  const video = block.video;
  const url = video?.url?.trim();
  const provider = video?.provider;
  const wrapperClass = block.layout === "full-width" ? "mx-auto max-w-6xl px-4" : "mx-auto max-w-4xl px-4";
  const poster = mediaUrl(video?.thumbnail);

  if (!url && !block.title && !block.subTitle) return null;

  let videoNode: React.ReactNode = null;
  if (provider === "youtube") {
    const id = getYouTubeVideoId(url);
    if (id) {
      videoNode = (
        <iframe
          src={`https://www.youtube.com/embed/${id}?rel=0`}
          title={video?.title ?? block.title ?? "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      );
    }
  } else if (provider === "vimeo") {
    const id = getVimeoVideoId(url);
    if (id) {
      videoNode = (
        <iframe
          src={`https://player.vimeo.com/video/${id}`}
          title={video?.title ?? block.title ?? "Video"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      );
    }
  } else if (url) {
    videoNode = (
      <video
        src={getStrapiMediaUrl(url)}
        poster={poster}
        controls={provider !== "other"}
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        aria-label={video?.title ?? block.title ?? "Video"}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <section className={block.layout === "background" ? "bg-muted py-16" : "py-16"}>
      <div className={wrapperClass}>
        <SectionHeading title={block.title} subTitle={block.subTitle} />
        {videoNode && (
          <div className="overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm">
            <div className="relative aspect-video w-full">{videoNode}</div>
          </div>
        )}
      </div>
    </section>
  );
}

function CardsBlock({ block }: { block: StrapiAboutCardsBlock }) {
  const cards = block.cards ?? [];
  if (!cards.length && !block.title && !block.subTitle) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title={block.title} subTitle={block.subTitle} />
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const url = mediaUrl(card.image);
            return (
              <article key={card.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {url && (
                  <div className="relative aspect-video bg-muted">
                    <Image
                      src={url}
                      alt={mediaAlt(card.image, card.title)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  {card.badge && (
                    <span className="mb-3 inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                      {card.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                  {card.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                  )}
                  <div className="mt-5">
                    <LinkButton link={card.link} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SharedMediaBlock({ block }: { block: StrapiAboutMediaBlock }) {
  const file = resolveStrapiMedia(block.file) ?? block.file;
  const url = file?.url ? getStrapiMediaUrl(file.url) : "";
  if (!url) return null;

  const mime = (file as { mime?: string })?.mime;
  const type = block.type ?? (mime?.startsWith("video/") ? "video" : mime?.startsWith("audio/") ? "audio" : "image");

  return (
    <section className="py-12">
      <div className="mx-auto max-w-5xl px-4">
        {type === "video" ? (
          <div className="overflow-hidden rounded-2xl bg-secondary">
            <video src={url} controls playsInline preload="metadata" className="w-full" aria-label="About media">
              Your browser does not support the video tag.
            </video>
          </div>
        ) : type === "audio" ? (
          <audio src={url} controls className="w-full">
            Your browser does not support the audio tag.
          </audio>
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
            <Image
              src={url}
              alt={(file as { alternativeText?: string | null })?.alternativeText ?? "About media"}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function QuoteBlock({ body }: { body: string | null | undefined }) {
  if (!body?.trim()) return null;
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <blockquote className="border-l-4 border-primary bg-muted py-6 pl-6 pr-8">
        <p className="text-lg italic leading-relaxed text-muted-foreground">{body}</p>
      </blockquote>
    </section>
  );
}

function SharedSliderBlock({
  block,
}: {
  block: {
    heading?: string | null;
    subHeading?: string | null;
    media?: StrapiMedia | null;
  };
}) {
  const url = mediaUrl(block.media ?? null);
  if (!url) return null;
  return (
    <section className="py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
          <Image
            src={url}
            alt={mediaAlt(block.media ?? null, block.heading ?? "Slide")}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" aria-hidden />
          {(block.heading || block.subHeading) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-white">
              {block.heading && <h3 className="text-xl font-semibold">{block.heading}</h3>}
              {block.subHeading && <p>{block.subHeading}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function AboutBlocks({ blocks }: { blocks: StrapiAboutBlock[] | null | undefined }) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.__component}-${block.id}-${index}`;
        switch (block.__component) {
          case "components.about-organization":
            return <AboutOrganization key={key} block={block} />;
          case "section.content":
            return <ContentBlock key={key} block={block} />;
          case "section.gallery":
            return <GallerySection key={key} block={block} />;
          case "section.stats":
            return <StatsBlock key={key} block={block} />;
          case "section.testimonials":
            return <TestimonialsSection key={key} block={block} />;
          case "section.tab-section":
            return <TabSection key={key} block={block} />;
          case "section.cta":
            return <CtaBlock key={key} block={block} />;
          case "section.features":
            return <FeaturesBlock key={key} block={block} />;
          case "section.accordions":
            return <AccordionsBlock key={key} block={block} />;
          case "section.video-section":
            return <VideoSectionBlock key={key} block={block} />;
          case "section.cards":
            return <CardsBlock key={key} block={block} />;
          case "shared.media":
            return <SharedMediaBlock key={key} block={block} />;
          case "shared.quote":
            return <QuoteBlock key={key} body={block.body} />;
          case "shared.rich-text":
            return (
              <section key={key} className="mx-auto max-w-4xl px-4 py-8">
                <RichTextContent content={block.body} />
              </section>
            );
          case "shared.slider":
            return <SharedSliderBlock key={key} block={block} />;
          case "components.slides":
            return <Slider key={key} slides={block.slides ?? []} />;
          default:
            return null;
        }
      })}
    </>
  );
}
