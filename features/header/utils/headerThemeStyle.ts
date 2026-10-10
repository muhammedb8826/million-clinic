import type { CSSProperties } from "react";
import type { StrapiHeaderColors } from "@/lib/strapi";

function pickHex(value: string | null | undefined): string | undefined {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || undefined;
}

/**
 * Builds inline CSS custom properties + direct colors for header theming.
 * Only sets values that exist in CMS; missing fields keep frontend defaults.
 */
export function headerThemeStyle(
  colors: StrapiHeaderColors | null | undefined,
  prefix: "th" | "mh"
): CSSProperties {
  if (!colors) return {};

  const style: Record<string, string> = {};
  const bg = pickHex(colors.backgroundColor);
  const text = pickHex(colors.textColor);
  const border = pickHex(colors.borderColor);
  const link = pickHex(colors.linkColor);
  const linkHover = pickHex(colors.linkHoverColor);
  const active = pickHex(colors.activeLinkColor);
  const btnBg = pickHex(colors.buttonBackgroundColor);
  const btnText = pickHex(colors.buttonTextColor);

  if (bg) {
    style.backgroundColor = bg;
    style[`--${prefix}-bg`] = bg;
  }
  if (text) {
    style.color = text;
    style[`--${prefix}-text`] = text;
  }
  if (border) {
    style.borderColor = border;
    style[`--${prefix}-border`] = border;
  }
  if (link) style[`--${prefix}-link`] = link;
  if (linkHover) style[`--${prefix}-link-hover`] = linkHover;
  if (active) style[`--${prefix}-link-active`] = active;
  if (btnBg) style[`--${prefix}-btn-bg`] = btnBg;
  if (btnText) style[`--${prefix}-btn-text`] = btnText;

  return style as CSSProperties;
}
