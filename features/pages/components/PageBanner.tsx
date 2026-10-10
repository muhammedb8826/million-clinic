import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiMedia } from "@/lib/strapi";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PageBannerProps {
  /** Single media, or array (first item used). When no image, fallback bar is shown if title/subTitle/breadcrumb set. */
  banner?: StrapiMedia | StrapiMedia[] | null;
  title?: string;
  breadcrumb?: BreadcrumbItemType[];
  /** When there is no banner image, use this variant for the fallback section. Default "muted". */
  noBannerVariant?: "muted" | "secondary" | "background";
}

function PageBreadcrumb({
  items,
  variant = "default",
}: {
  items: BreadcrumbItemType[];
  variant?: "default" | "light" | "secondary";
}) {
  if (!items?.length) return null;
  const listClass =
    variant === "light"
      ? "justify-center text-white/90 [&_[data-slot=breadcrumb-separator]_svg]:text-white/60"
      : variant === "secondary"
        ? "justify-center text-secondary-foreground/85 [&_[data-slot=breadcrumb-separator]_svg]:text-secondary-foreground/55"
        : "justify-center text-muted-foreground";
  const linkClass =
    variant === "light"
      ? "text-white/90 hover:text-white"
      : variant === "secondary"
        ? "text-secondary-foreground/90 hover:text-secondary-foreground"
        : undefined;
  const pageClass =
    variant === "light"
      ? "text-white"
      : variant === "secondary"
        ? "text-secondary-foreground font-medium"
        : undefined;

  return (
    <Breadcrumb className="mt-2">
      <BreadcrumbList className={`${listClass} flex-wrap gap-y-1`}>
        {items.map((item, i) => (
          <Fragment key={i}>
            <BreadcrumbItem className="max-w-48 sm:max-w-none">
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className={`truncate ${linkClass ?? ""}`.trim()}>
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className={`truncate ${pageClass ?? ""}`.trim()}>
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {i < items.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function getBannerMedia(banner: StrapiMedia | StrapiMedia[] | null | undefined): StrapiMedia | null {
  if (!banner) return null;
  if (Array.isArray(banner)) return banner[0] ?? null;
  return banner;
}

export function PageBanner({ banner, title, breadcrumb, noBannerVariant = "muted" }: PageBannerProps) {
  const bannerMedia = getBannerMedia(banner);
  const media = resolveStrapiMedia(bannerMedia) ?? (bannerMedia as { url?: string; alternativeText?: string | null });
  const url = media?.url ? getStrapiMediaUrl(media.url) : "";

  if (!url) {
    if (!title && !breadcrumb?.length) return null;
    const isSecondary = noBannerVariant === "secondary";
    const sectionClass =
      noBannerVariant === "background"
        ? "bg-background"
        : isSecondary
          ? "bg-secondary text-secondary-foreground"
          : "bg-muted";
    return (
      <section
        className={`relative flex w-full flex-col items-center justify-center overflow-hidden px-4 py-10 sm:py-12 md:aspect-4/1 md:max-h-80 md:py-0 ${sectionClass}`}
      >
        <div className="mx-auto max-w-4xl text-center">
          {title && (
            <h1
              className={`text-2xl font-bold sm:text-4xl md:text-5xl ${isSecondary ? "text-secondary-foreground" : "text-foreground"}`}
            >
              {title}
            </h1>
          )}
          {breadcrumb?.length ? (
            <PageBreadcrumb items={breadcrumb} variant={isSecondary ? "secondary" : "default"} />
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-50 w-full flex-col items-center justify-center overflow-hidden bg-muted aspect-4/1 max-h-60 sm:max-h-70 md:max-h-80">
      <Image
        src={url}
        alt={media?.alternativeText ?? title ?? "Page banner"}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      {(title || breadcrumb?.length) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 px-4 text-center">
          {title && (
            <h1 className="text-2xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl">
              {title}
            </h1>
          )}
          {breadcrumb?.length ? <PageBreadcrumb items={breadcrumb} variant="light" /> : null}
        </div>
      )}
    </section>
  );
}
