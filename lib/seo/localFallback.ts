/**
 * Used when Strapi page SEO and global `defaultSeo` do not supply a value.
 * `shareImagePath` must match a file under `/public`.
 */
export const LOCAL_FALLBACK_SEO = {
  metaTitle: "Mako Foundation",
  metaDescription:
    "Supporting communities through education, healthcare, and charitable programs.",
  /** Served from `public/mako-foundation.png` */
  shareImagePath: "/mako-foundation.png",
} as const;
