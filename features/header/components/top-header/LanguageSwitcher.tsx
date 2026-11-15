"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FALLBACK_LOCALES, LOCALE_COOKIE, localeDirection } from "@/lib/i18n/locale-client";

export interface LocaleOption {
  code: string;
  name: string;
  dir?: "ltr" | "rtl";
}

function setLocaleCookie(code: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(code)};path=/;max-age=31536000;SameSite=Lax`;
}

function getLocaleFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

interface LanguageSwitcherProps {
  /** Locales from Strapi i18n (`GET /api/i18n/locales`) */
  locales?: { code: string; name: string; isDefault?: boolean }[];
}

export function LanguageSwitcher({ locales }: LanguageSwitcherProps) {
  const router = useRouter();

  const options: LocaleOption[] = useMemo(() => {
    const source = locales?.length ? locales : FALLBACK_LOCALES;
    return source.map((l) => ({
      code: l.code,
      name: l.name,
      dir: localeDirection(l.code),
    }));
  }, [locales]);

  const defaultCode =
    locales?.find((l) => l.isDefault)?.code ?? options[0]?.code ?? "en";

  const [current, setCurrent] = useState<string>(defaultCode);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fromCookie = getLocaleFromCookie();
    if (fromCookie && options.some((o) => o.code === fromCookie)) {
      setCurrent(fromCookie);
      return;
    }
    setCurrent(defaultCode);
  }, [options, defaultCode]);

  const selectLocale = useCallback(
    (code: string) => {
      setLocaleCookie(code);
      setCurrent(code);
      setOpen(false);
      router.refresh();
    },
    [router],
  );

  const currentOption = options.find((o) => o.code === current) ?? options[0];

  if (options.length <= 1) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span aria-hidden>{currentOption?.name ?? current}</span>
        <svg className="h-4 w-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-100" aria-hidden onClick={() => setOpen(false)} />
          <ul
            className="absolute right-0 top-full z-110 mt-1 min-w-40 rounded-md border border-border bg-popover py-1 shadow-lg"
            role="listbox"
          >
            {options.map((opt) => (
              <li key={opt.code} role="option" aria-selected={current === opt.code}>
                <button
                  type="button"
                  onClick={() => selectLocale(opt.code)}
                  className={`block w-full px-3 py-2 text-left text-sm text-popover-foreground transition hover:bg-accent hover:text-accent-foreground ${current === opt.code ? "bg-accent font-medium text-accent-foreground" : ""}`}
                >
                  {opt.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
