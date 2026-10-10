"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RichTextContent } from "@/features/pages";
import type {
  StrapiFeaturedCard,
  StrapiIcon,
  StrapiLink,
  StrapiTabAlignment,
  StrapiTabItem,
  StrapiTabSectionBlock,
  StrapiTabVariant,
} from "@/lib/strapi";

function linkHref(link: StrapiLink | null | undefined): string | null {
  const url = link?.url?.trim();
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/") ||
    url.startsWith("#") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  ) {
    return url;
  }
  return `/${url}`;
}

function IconSvg({ icon }: { icon: StrapiIcon | null | undefined }) {
  if (!icon?.iconData) return null;
  const w = icon.width ?? 24;
  const h = icon.height ?? 24;
  return (
    <svg
      width={20}
      height={20}
      viewBox={`0 0 ${w} ${h}`}
      fill="currentColor"
      className="shrink-0"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: icon.iconData }}
    />
  );
}

function DonateLink({
  link,
  className,
}: {
  link: StrapiLink | null | undefined;
  className: string;
}) {
  const href = linkHref(link);
  const title = link?.title?.trim();
  if (!href || !title) return null;

  if (link?.isExternal || /^https?:\/\//i.test(href)) {
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

function FeaturedCard({ card }: { card: StrapiFeaturedCard }) {
  const title = card.title?.trim();
  const description = card.description?.trim();
  const hasCta = Boolean(linkHref(card.link) && card.link?.title?.trim());

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:border-primary/40 hover:shadow-md">
      {card.icon?.iconData && (
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <IconSvg icon={card.icon} />
        </span>
      )}
      {title && (
        <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h3>
      )}
      {description && (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {hasCta && (
        <div className="mt-6">
          <DonateLink
            link={card.link}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          />
        </div>
      )}
    </article>
  );
}

function resolveInitialIndex(tabs: StrapiTabItem[], defaultActiveTab?: number | null): number {
  if (!tabs.length) return 0;
  const raw = defaultActiveTab ?? 1;
  // Support both 1-based and 0-based CMS values.
  if (raw >= 1 && raw <= tabs.length) return raw - 1;
  if (raw >= 0 && raw < tabs.length) return raw;
  return 0;
}

function tabListClass(variant: StrapiTabVariant, alignment: StrapiTabAlignment): string {
  const justify =
    alignment === "left" ? "justify-start" : alignment === "center" ? "justify-center" : "justify-start sm:justify-center";

  switch (variant) {
    case "underline":
      return `flex flex-wrap gap-1 border-b border-border ${justify}`;
    case "boxed":
      return `inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-border bg-muted/50 p-1 ${
        alignment === "center" || alignment === "full-width" ? "mx-auto" : ""
      }`;
    case "vertical":
      return "flex flex-col gap-1";
    case "pills":
    default:
      return `flex flex-wrap gap-2 ${justify}`;
  }
}

function tabButtonClass(variant: StrapiTabVariant, active: boolean): string {
  const base =
    "inline-flex items-center gap-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  switch (variant) {
    case "underline":
      return `${base} border-b-2 px-4 py-3 ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`;
    case "boxed":
      return `${base} rounded-lg px-4 py-2.5 ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`;
    case "vertical":
      return `${base} w-full rounded-lg px-4 py-3 text-left ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
      }`;
    case "pills":
    default:
      return `${base} rounded-full px-5 py-2.5 ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      }`;
  }
}

interface TabSectionProps {
  block: StrapiTabSectionBlock;
}

export function TabSection({ block }: TabSectionProps) {
  const tabs = useMemo(() => block.tabs ?? [], [block.tabs]);
  const variant: StrapiTabVariant = block.variant ?? "pills";
  const alignment: StrapiTabAlignment = block.alignment ?? "full-width";
  const [activeIndex, setActiveIndex] = useState(() =>
    resolveInitialIndex(tabs, block.defaultActiveTab),
  );

  if (!tabs.length && !block.title?.trim() && !block.subTitle?.trim()) return null;

  const safeIndex = Math.min(Math.max(activeIndex, 0), Math.max(tabs.length - 1, 0));
  const activeTab = tabs[safeIndex];
  const cards = activeTab?.featuredCard ?? [];
  const extraLinks = (activeTab?.link ?? []).filter((l) => linkHref(l) && l.title?.trim());
  const textBlocks = (activeTab?.textContent ?? []).filter((t) => t.body && t.body.length > 0);

  const headingAlign =
    alignment === "left" ? "text-left" : alignment === "center" ? "text-center" : "text-center";
  const contentMax =
    alignment === "full-width" ? "max-w-6xl" : alignment === "center" ? "max-w-4xl" : "max-w-5xl";

  const isVertical = variant === "vertical";

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.97_0.02_65)_0%,transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.22_0.02_65)_0%,transparent_55%)]"
        aria-hidden
      />

      <div className={`relative mx-auto ${contentMax} px-4`}>
        {(block.title?.trim() || block.subTitle?.trim()) && (
          <div className={`mb-10 max-w-3xl sm:mb-12 ${alignment === "left" ? "" : "mx-auto"} ${headingAlign}`}>
            {block.subTitle?.trim() && (
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                {block.subTitle}
              </p>
            )}
            {block.title?.trim() && (
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {block.title}
              </h2>
            )}
          </div>
        )}

        <div className={isVertical ? "grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10" : "space-y-8"}>
          {tabs.length > 0 && (
            <div
              role="tablist"
              aria-label={block.title?.trim() || "Donation options"}
              className={tabListClass(variant, alignment)}
            >
              {tabs.map((tab, index) => {
                const selected = index === safeIndex;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`donate-tab-${block.id}-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`donate-panel-${block.id}-${tab.id}`}
                    tabIndex={selected ? 0 : -1}
                    className={tabButtonClass(variant, selected)}
                    onClick={() => setActiveIndex(index)}
                  >
                    <IconSvg icon={tab.icon} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab && (
            <div
              role="tabpanel"
              id={`donate-panel-${block.id}-${activeTab.id}`}
              aria-labelledby={`donate-tab-${block.id}-${activeTab.id}`}
              className="min-w-0"
            >
              {cards.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                  {cards.map((card) => (
                    <FeaturedCard key={card.id} card={card} />
                  ))}
                </div>
              )}

              {textBlocks.length > 0 && (
                <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
                  {textBlocks.map((item) => (
                    <RichTextContent key={item.id} content={item.body ?? null} />
                  ))}
                </div>
              )}

              {extraLinks.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {extraLinks.map((link) => (
                    <DonateLink
                      key={link.id}
                      link={link}
                      className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
                    />
                  ))}
                </div>
              )}

              {!cards.length && !textBlocks.length && !extraLinks.length && (
                <p className="text-muted-foreground">No content for this option yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
