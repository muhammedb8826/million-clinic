"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type {
  StrapiFooter,
  StrapiFooterLink,
  StrapiSocialIcon,
} from "@/lib/strapi";

/** Light-colored logo for dark footer background; used when CMS has no logo or CMS asset fails */
const FOOTER_LOGO_FALLBACK = "/logo/side-logo-white.png";

function ensureUrl(url: string | null | undefined): string {
  if (url == null || typeof url !== "string" || !url.trim()) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function contactLinkHref(url: string): string {
  const trimmed = url.trim();
  if (/@/.test(trimmed) && !trimmed.includes(":")) return `mailto:${trimmed}`;
  if (/^[\d\s\-+()]+$/.test(trimmed.replace(/\s/g, ""))) return `tel:${trimmed}`;
  return ensureUrl(trimmed);
}

function navLinkHref(link: StrapiFooterLink): string {
  const url = link?.url;
  if (url == null || url === "") return "/";
  if (link?.isExternal) return url;
  return typeof url === "string" && url.startsWith("/") ? url : `/${url}`;
}

interface FooterProps {
  data: StrapiFooter | null | undefined;
}

export function Footer({ data }: FooterProps) {
  const [localLogoOk, setLocalLogoOk] = useState(true);
  const [cmsLogoFailed, setCmsLogoFailed] = useState(false);
  const [cmsDarkLogoFailed, setCmsDarkLogoFailed] = useState(false);
  if (!data) return null;

  const about = data.about;
  const quickLinks = data.quickLinks;
  const contact = data.contactInformation;
  const followUs = data.followUs;
  const columns = data.columns ?? [];
  const socialLinks = data.socialLinks ?? followUs?.socialLinks ?? [];
  const bottomLinks = data.bottomLinks ?? [];
  const copyRight = data.copyRight;

  const footerLogo = data.logo ?? about?.logo;
  const footerDarkLogo = data.darkLogo;
  const logo = resolveStrapiMedia(footerLogo);
  const darkLogo = resolveStrapiMedia(footerDarkLogo);
  const logoSrc = logo?.url ? getStrapiMediaUrl(logo.url) : "";
  const darkLogoSrc = darkLogo?.url ? getStrapiMediaUrl(darkLogo.url) : "";
  const logoAlt = (logo as { alternativeText?: string })?.alternativeText
    ?? (darkLogo as { alternativeText?: string })?.alternativeText
    ?? "Logo";

  const lightLogoSrc =
    logoSrc && !cmsLogoFailed ? logoSrc : localLogoOk ? FOOTER_LOGO_FALLBACK : "";
  const darkModeLogoSrc =
    darkLogoSrc && !cmsDarkLogoFailed
      ? darkLogoSrc
      : localLogoOk
        ? FOOTER_LOGO_FALLBACK
        : logoSrc && !cmsLogoFailed
          ? logoSrc
          : "";

  const showLightLogo = Boolean(lightLogoSrc);
  const showDarkLogo = Boolean(darkModeLogoSrc);
  const hasFooterLogo = showLightLogo || showDarkLogo;
  const hasLegacyColumns = Boolean(about || quickLinks || contact || followUs);
  const hasContent =
    hasFooterLogo ||
    data.intro ||
    columns.length > 0 ||
    bottomLinks.length > 0 ||
    socialLinks.length > 0 ||
    hasLegacyColumns ||
    copyRight;
  if (!hasContent) return null;

  return (
    <footer className="border-t border-secondary-foreground/20 bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {hasFooterLogo && (
          <Link
            href="/"
            className="mb-8 flex w-fit"
            aria-label="Home"
          >
            {showLightLogo && (
              <Image
                src={lightLogoSrc}
                alt={logoAlt}
                width={logo?.width ?? darkLogo?.width ?? 160}
                height={logo?.height ?? darkLogo?.height ?? 80}
                className="h-12 w-auto object-contain opacity-95 transition hover:opacity-100 dark:hidden"
                onError={() => {
                  if (logoSrc && lightLogoSrc === logoSrc) setCmsLogoFailed(true);
                  else setLocalLogoOk(false);
                }}
              />
            )}
            {showDarkLogo && (
              <Image
                src={darkModeLogoSrc}
                alt={logoAlt}
                width={darkLogo?.width ?? logo?.width ?? 160}
                height={darkLogo?.height ?? logo?.height ?? 80}
                className={`h-12 w-auto object-contain opacity-95 transition hover:opacity-100 ${showLightLogo ? "hidden dark:block" : ""}`}
                onError={() => {
                  if (darkLogoSrc && darkModeLogoSrc === darkLogoSrc) setCmsDarkLogoFailed(true);
                  else setLocalLogoOk(false);
                }}
              />
            )}
          </Link>
        )}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {(about || data.intro) && (
            <div>
              {about?.title && (
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
                  {about.title}
                </h3>
              )}
              {(about?.description || data.intro) && (
                <p className="whitespace-pre-line text-sm text-secondary-foreground/85">
                  {about?.description ?? data.intro}
                </p>
              )}
            </div>
          )}

          {columns.map((column) => (
            <div key={column.id}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
                {column.title}
              </h3>
              {column.links?.length > 0 && (
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.id}>
                      {link.isExternal ? (
                        <a
                          href={navLinkHref(link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-secondary-foreground/85 transition hover:text-primary hover:underline dark:hover:text-primary"
                        >
                          {link.title}
                        </a>
                      ) : (
                        <Link
                          href={navLinkHref(link)}
                          className="text-sm text-secondary-foreground/85 transition hover:text-primary hover:underline dark:hover:text-primary"
                        >
                          {link.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {quickLinks && quickLinks.link?.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
                {quickLinks.title}
              </h3>
              <ul className="space-y-2">
                {quickLinks.link.map((link) => (
                  <li key={link.id}>
                    {link.isExternal ? (
                      <a
                        href={navLinkHref(link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-secondary-foreground/85 transition hover:text-primary hover:underline dark:hover:text-primary"
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link
                        href={navLinkHref(link)}
                        className="text-sm text-secondary-foreground/85 transition hover:text-primary hover:underline dark:hover:text-primary"
                      >
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {contact && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
                {contact.title}
              </h3>
              {contact.address && (
                <p className="mb-3 text-sm text-secondary-foreground/85">
                  {contact.address}
                </p>
              )}
              {contact.link?.length > 0 && (
                <ul className="space-y-2">
                  {contact.link.map((link) => (
                    <li key={link.id}>
                      <a
                        href={contactLinkHref(link.url)}
                        className="flex items-center gap-2 text-sm text-secondary-foreground/85 transition hover:text-primary dark:hover:text-primary"
                      >
                        {link.icon?.iconData && (
                          <span
                            className="inline-flex shrink-0"
                            style={{
                              width: link.icon.width ?? 20,
                              height: link.icon.height ?? 20,
                            }}
                            aria-hidden
                          >
                            <svg
                              width={link.icon.width ?? 20}
                              height={link.icon.height ?? 20}
                              viewBox={`0 0 ${link.icon.width ?? 24} ${link.icon.height ?? 24}`}
                              fill="currentColor"
                              dangerouslySetInnerHTML={{
                                __html: link.icon.iconData,
                              }}
                            />
                          </span>
                        )}
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {socialLinks.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
                {followUs?.title ?? "Follow Us"}
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((item: StrapiSocialIcon) => (
                  <a
                    key={item.id}
                    href={ensureUrl(item.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-foreground/85 transition hover:text-primary dark:hover:text-primary"
                    aria-label={item.icon?.iconName ?? "Social link"}
                  >
                    <span
                      className="inline-flex"
                      style={{
                        width: item.icon?.width ?? 24,
                        height: item.icon?.height ?? 24,
                      }}
                    >
                      <svg
                        width={item.icon?.width ?? 24}
                        height={item.icon?.height ?? 24}
                        viewBox={`0 0 ${item.icon?.width ?? 24} ${item.icon?.height ?? 24}`}
                        fill="currentColor"
                        dangerouslySetInnerHTML={{
                          __html: item.icon?.iconData ?? "",
                        }}
                      />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        {bottomLinks.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-secondary-foreground/20 pt-6">
            {bottomLinks.map((link) =>
              link.isExternal ? (
                <a
                  key={link.id}
                  href={navLinkHref(link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-secondary-foreground/75 transition hover:text-primary hover:underline dark:hover:text-primary"
                >
                  {link.title}
                </a>
              ) : (
                <Link
                  key={link.id}
                  href={navLinkHref(link)}
                  className="text-xs text-secondary-foreground/75 transition hover:text-primary hover:underline dark:hover:text-primary"
                >
                  {link.title}
                </Link>
              )
            )}
          </div>
        )}
        {copyRight && (
          <div className="mt-8 border-t border-secondary-foreground/20 pt-8">
            <p className="text-center text-xs text-secondary-foreground/75">
              {copyRight}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
