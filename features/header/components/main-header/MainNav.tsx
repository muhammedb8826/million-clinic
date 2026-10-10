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
import { headerThemeStyle } from "../../utils/headerThemeStyle";

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
    <div className="flex w-full min-w-0 items-center justify-between gap-3">
      <Link
        href="/"
        className="flex min-w-0 max-w-[calc(100%-3.25rem)] shrink items-center gap-2 text-lg font-semibold text-[color:var(--mh-text,var(--foreground))] transition hover:text-[color:var(--mh-link-hover,var(--primary))] md:max-w-none md:shrink-0"
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
                className="h-10 w-auto max-w-full object-contain object-left sm:h-12 md:h-16 md:max-w-none dark:hidden"
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
                className={`h-10 w-auto max-w-full object-contain object-left sm:h-12 md:h-16 md:max-w-none ${showLightLogo ? "hidden dark:block" : ""}`}
                priority
                onError={() => {
                  if (darkLogoSrc && darkModeLogoSrc === darkLogoSrc) setCmsDarkLogoFailed(true);
                  else setLocalLogoOk(false);
                }}
              />
            )}
          </>
        ) : (
          <span className="truncate">{siteName}</span>
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
                className="rounded-md px-3 py-2 text-sm font-medium text-[color:var(--mh-link,var(--foreground))] transition hover:bg-black/5 hover:text-[color:var(--mh-link-hover,var(--primary))] aria-[current=page]:text-[color:var(--mh-link-active,var(--primary))] dark:hover:bg-white/10"
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
                  className="flex items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium text-[color:var(--mh-link,var(--foreground))] transition hover:bg-black/5 hover:text-[color:var(--mh-link-hover,var(--primary))] dark:hover:bg-white/10"
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
                    className="inline-flex rounded-md bg-[var(--mh-btn-bg,var(--primary))] px-4 py-2 text-sm font-medium text-[color:var(--mh-btn-text,var(--primary-foreground))] transition hover:opacity-90"
                  />
                ))}
              </div>
            )}
          </nav>

          {/* Mobile menu button — always keep visible; never shrink off-screen */}
          <button
            type="button"
            className="relative z-50 ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[color:var(--mh-border,var(--border))] bg-[var(--mh-bg,var(--background))] text-[color:var(--mh-text,var(--foreground))] md:hidden"
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
          className="fixed left-0 right-0 top-16 z-40 flex max-h-[calc(100vh-4rem)] flex-col overflow-auto border-t border-[color:var(--mh-border,var(--border))] bg-[var(--mh-bg,var(--background))] text-[color:var(--mh-text,var(--foreground))] md:hidden"
          aria-label="Main navigation"
        >
          <div className="flex-1 space-y-1 px-4 py-4">
            {menu.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                className="block rounded-md px-3 py-2 text-[color:var(--mh-link,var(--foreground))] hover:bg-black/5 hover:text-[color:var(--mh-link-hover,var(--primary))] aria-[current=page]:text-[color:var(--mh-link-active,var(--primary))] dark:hover:bg-white/10"
              />
            ))}
            {subMenu.map((sub) => (
              <div key={sub.id} className="py-1">
                <span className="block px-3 py-2 text-sm font-medium opacity-70">
                  {sub.title}
                </span>
                {sub.dropDown?.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    className="block rounded-md py-2 pl-6 pr-3 text-[color:var(--mh-link,var(--foreground))] hover:bg-black/5 hover:text-[color:var(--mh-link-hover,var(--primary))] dark:hover:bg-white/10"
                  />
                ))}
              </div>
            ))}
            {buttons.map((btn) => (
              <div key={btn.id} className="pt-2">
                <NavLink
                  item={btn}
                  className="inline-flex rounded-md bg-[var(--mh-btn-bg,var(--primary))] px-4 py-2 text-sm font-medium text-[color:var(--mh-btn-text,var(--primary-foreground))]"
                />
              </div>
            ))}
          </div>
          {/* Mobile: top header content (CTA, theme, language, social) */}
          <div
            className="mt-auto border-t border-[color:var(--th-border,var(--border))] bg-[var(--th-bg,color-mix(in_oklab,var(--muted)_50%,transparent))] px-4 py-4 text-[color:var(--th-text,var(--muted-foreground))] [&_a]:text-[color:var(--th-link,currentColor)] [&_a:hover]:text-[color:var(--th-link-hover,var(--primary))]"
            style={headerThemeStyle(topHeader?.colors, "th")}
          >
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
                    className="transition"
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
