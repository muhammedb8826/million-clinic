/** Client-safe locale constants (no `next/headers`). */

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const DEFAULT_LOCALE = "en";
export const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

/** Used only when Strapi locales cannot be loaded — English only */
export const FALLBACK_LOCALES = [
  { code: "en", name: "English", isDefault: true },
] as const;

export function localeDirection(code: string): "ltr" | "rtl" {
  return RTL_LOCALES.has(code) ? "rtl" : "ltr";
}
