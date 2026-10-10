/**
 * Used when Strapi page SEO and global `defaultSeo` do not supply a value.
 * `shareImagePath` must match a file under `/public`.
 */
export const LOCAL_FALLBACK_SEO = {
  metaTitle: "Million Medium Clinic | Supporting Communities",
  metaDescription:
    "Supporting communities through healthcare. We provide accessible and affordable healthcare services to underserved populations.",
  /** Served from `public/million-clinic.jpg` */
  shareImagePath: "/million-clinic.jpg",
} as const;
