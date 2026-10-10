"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiHeader, StrapiMenuItem, StrapiSubMenuItem, StrapiTopHeader } from "@/lib/strapi";
import { ThemeSwitcher } from "../top-header/ThemeSwitcher";
import { LanguageSwitcher } from "../top-header/LanguageSwitcher";
import { TopHeaderCtaLink } from "../top-header/TopHeaderCtaLink";

/** Local fallback: dark mark for light UI, light mark for dark UI */
const LOCAL_LOGO_DEFAULT = "/logo/side-logo-black.png";
const LOCAL_LOGO_DARK = "/logo/side-logo-white.png";

function href(item: StrapiMenuItem): string {
  const url = item?.url;
  if (url == null || url === "") return "/";
  if (item.isExternal) return url;
  return typeof url === "string" && url.startsWith("/") ? url : `/${url}`;
}

function NavLink({
  item,
  className = "",
}: {
  item: StrapiMenuItem;
  className?: string;
}) {
  const pathname = usePathname();
  const url = href(item);
  const isActive = !item.isExternal && pathname === url;
  const content = (
    <>
      {item.title}
      {item.isExternal && (
        <span className="ml-0.5 inline-block opacity-70" aria-hidden>
          ↗
        </span>
      )}
    </>
  );

  if (item.isExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={url} className={className} aria-current={isActive ? "page" : undefined}>
      {content}
    </Link>
  );
}

function Dropdown({ sub }: { sub: StrapiSubMenuItem }) {
  return (
    <div className="absolute left-0 top-full z-20 min-w-44 rounded-md border border-border bg-popover py-1 shadow-lg">
      {sub.dropDown?.map((item) => (
        <div key={item.id} className="px-1">
          <NavLink
            item={item}
            className="block rounded px-3 py-2 text-sm text-popover-foreground transition hover:bg-accent hover:text-accent-foreground"
          />
        </div>
      ))}
    </div>
  );
}

function ensureUrl(url: string | null | undefined): string {
  if (url == null || typeof url !== "string" || !url.trim()) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

interface MainNavProps {
  header: StrapiHeader;
  topHeader: StrapiTopHeader | null;
  siteName: string;
}

export function MainNav({ header, topHeader, siteName }: MainNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [localLogoOk, setLocalLogoOk] = useState(true);
  const [cmsLogoFailed, setCmsLogoFailed] = useState(false);
  const [cmsDarkLogoFailed, setCmsDarkLogoFailed] = useState(false);

  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setOpenDropdownId(null);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleClick = () => closeAll();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [mobileOpen, closeAll]);

  const menu = header.menu ?? [];
  const subMenu = header.subMenu ?? [];
  const buttons = header.button ?? [];
  const hasNav = menu.length > 0 || subMenu.length > 0 || buttons.length > 0;

  const logo = resolveStrapiMedia(header.logo);
  const darkLogo = resolveStrapiMedia(header.darkLogo);
  const logoSrc = logo?.url ? getStrapiMediaUrl(logo.url) : "";
  const darkLogoSrc = darkLogo?.url ? getStrapiMediaUrl(darkLogo.url) : "";
  const logoAlt = logo?.alternativeText ?? darkLogo?.alternativeText ?? siteName;

  const lightLogoSrc =
    logoSrc && !cmsLogoFailed ? logoSrc : localLogoOk ? LOCAL_LOGO_DEFAULT : "";
  const darkModeLogoSrc =
    darkLogoSrc && !cmsDarkLogoFailed
      ? darkLogoSrc
      : localLogoOk
        ? LOCAL_LOGO_DARK
        : logoSrc && !cmsLogoFailed
          ? logoSrc
          : "";

  const showLightLogo = Boolean(lightLogoSrc);
  const showDarkLogo = Boolean(darkModeLogoSrc);
  const showLogo = showLightLogo || showDarkLogo;

  return (
    <div className="flex w-full items-center justify-between gap-6">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2 text-lg font-semibold text-foreground transition hover:text-primary"
        aria-label={siteName}
      >
        {showLogo ? (
          <>
            {showLightLogo && (
              <Image
                src={lightLogoSrc}
                alt={logoAlt}
                width={logo?.width ?? darkLogo?.width ?? 160}
                height={logo?.height ?? darkLogo?.height ?? 80}
                className="h-12 w-auto object-contain dark:hidden"
                priority
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
                className={`h-12 w-auto object-contain ${showLightLogo ? "hidden dark:block" : ""}`}
                priority
                onError={() => {
                  if (darkLogoSrc && darkModeLogoSrc === darkLogoSrc) setCmsDarkLogoFailed(true);
                  else setLocalLogoOk(false);
                }}
              />
            )}
          </>
        ) : (
          siteName
        )}
      </Link>

      {hasNav && (
        <>
          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {menu.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground aria-[current=page]:text-primary"
              />
            ))}
            {subMenu.map((sub) => (
              <div
                key={sub.id}
                className="relative"
                onMouseEnter={() => setOpenDropdownId(sub.id)}
                onMouseLeave={() => setOpenDropdownId(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                  aria-expanded={openDropdownId === sub.id}
                  aria-haspopup="true"
                >
                  {sub.title}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdownId === sub.id && sub.dropDown?.length > 0 && (
                  <Dropdown sub={sub} />
                )}
              </div>
            ))}
            {buttons.length > 0 && (
              <div className="ml-2 flex items-center gap-2">
                {buttons.map((btn) => (
                  <NavLink
                    key={btn.id}
                    item={btn}
                    className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  />
                ))}
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            onClick={(e) => {
              e.stopPropagation();
              setMobileOpen((v) => !v);
            }}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </>
      )}

      {/* Mobile panel */}
      {mobileOpen && hasNav && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/20 md:hidden"
          aria-hidden
          onClick={closeAll}
        />
      )}
      {mobileOpen && hasNav && (
        <nav
          className="fixed left-0 right-0 top-16 z-40 flex max-h-[calc(100vh-4rem)] flex-col overflow-auto border-t border-border bg-background md:hidden"
          aria-label="Main navigation"
        >
          <div className="flex-1 space-y-1 px-4 py-4">
            {menu.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                className="block rounded-md px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground"
              />
            ))}
            {subMenu.map((sub) => (
              <div key={sub.id} className="py-1">
                <span className="block px-3 py-2 text-sm font-medium text-muted-foreground">
                  {sub.title}
                </span>
                {sub.dropDown?.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    className="block rounded-md py-2 pl-6 pr-3 text-foreground hover:bg-accent hover:text-accent-foreground"
                  />
                ))}
              </div>
            ))}
            {buttons.map((btn) => (
              <div key={btn.id} className="pt-2">
                <NavLink
                  item={btn}
                  className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                />
              </div>
            ))}
          </div>
          {/* Mobile: top header content (CTA, theme, language, social) */}
          <div className="mt-auto border-t border-border bg-muted/50 px-4 py-4">
            {(topHeader?.cta?.length ?? 0) > 0 && (
              <div className="mb-3 flex flex-col gap-2">
                {topHeader?.cta?.map((item) => (
                  <TopHeaderCtaLink key={item.id} item={item} />
                ))}
              </div>
            )}
            {(topHeader?.socialIcon?.length ?? 0) > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {topHeader?.socialIcon?.map((item) => (
                  <a
                    key={item.id}
                    href={ensureUrl(item.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-primary"
                    aria-label={item.icon?.iconName ?? "Social link"}
                  >
                    <svg
                      className="inline-block"
                      width={item.icon?.width ?? 24}
                      height={item.icon?.height ?? 24}
                      viewBox={`0 0 ${item.icon?.width ?? 24} ${item.icon?.height ?? 24}`}
                      fill="currentColor"
                      dangerouslySetInnerHTML={{ __html: item.icon?.iconData ?? "" }}
                    />
                  </a>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <LanguageSwitcher locales={topHeader?.languages} />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
