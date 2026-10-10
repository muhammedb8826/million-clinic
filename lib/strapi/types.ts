/**
 * Strapi API types for global and related entities
 */

export interface StrapiIcon {
  width: number;
  height: number;
  iconData: string;
  iconName: string;
  isSvgEditable: boolean;
  isIconNameEditable: boolean;
}

export interface StrapiSocialIcon {
  id: number;
  url: string;
  icon: StrapiIcon;
}

/** Top header CTA (email, phone, etc.) */
export interface StrapiTopHeaderCta {
  id: number;
  title: string;
  url: string;
  icon: StrapiIcon;
}

/** Locale/language from Strapi i18n or custom component */
export interface StrapiLocale {
  id?: number;
  code: string;
  name: string;
  isDefault?: boolean;
}

export interface StrapiTopHeader {
  id: number;
  socialIcon: StrapiSocialIcon[];
  cta?: StrapiTopHeaderCta[];
  languages?: StrapiLocale[];
}

/** Main header nav link (menu item or dropdown item) */
export interface StrapiMenuItem {
  id: number;
  title: string;
  url: string;
  isExternal: boolean;
}

/** Submenu with dropdown items */
export interface StrapiSubMenuItem {
  id: number;
  title: string;
  dropDown: StrapiMenuItem[];
}

/** Strapi media (image) for logo etc. */
export interface StrapiMedia {
  id: number;
  documentId?: string;
  name: string;
  alternativeText: string | null;
  caption?: string | null;
  width: number;
  height: number;
  url: string;
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
  [key: string]: unknown;
}

/** Main header: logo, menu, submenus with dropdowns, CTA buttons */
export interface StrapiHeader {
  id: number;
  logo?: StrapiMedia | null;
  darkLogo?: StrapiMedia | null;
  menu: StrapiMenuItem[];
  subMenu: StrapiSubMenuItem[];
  button: StrapiMenuItem[];
}

/** Footer link (reusable for quickLinks, contact) */
export interface StrapiFooterLink {
  id: number;
  title: string;
  url: string;
  isExternal?: boolean;
  icon?: StrapiIcon;
}

/** Footer about section */
export interface StrapiFooterAbout {
  id: number;
  title: string;
  description: string | null;
  logo?: StrapiMedia | null;
}

/** Footer quick links section */
export interface StrapiFooterQuickLinks {
  id: number;
  title: string;
  link: StrapiFooterLink[];
}

/** Footer contact section */
export interface StrapiFooterContact {
  id: number;
  title: string;
  address: string | null;
  link: StrapiFooterLink[];
}

/** Footer follow us section */
export interface StrapiFooterFollowUs {
  id: number;
  title: string;
  socialLinks: StrapiSocialIcon[];
}

export interface StrapiFooterColumn {
  id: number;
  title: string;
  links: StrapiFooterLink[];
}

/** Footer with all sections */
export interface StrapiFooter {
  id: number;
  copyRight?: string | null;
  intro?: string | null;
  logo?: StrapiMedia | null;
  darkLogo?: StrapiMedia | null;
  columns?: StrapiFooterColumn[];
  socialLinks?: StrapiSocialIcon[];
  bottomLinks?: StrapiFooterLink[];
  /** @deprecated legacy footer schema */
  about?: StrapiFooterAbout | null;
  /** @deprecated legacy footer schema */
  quickLinks?: StrapiFooterQuickLinks | null;
  /** @deprecated legacy footer schema */
  contactInformation?: StrapiFooterContact | null;
  /** @deprecated legacy footer schema */
  followUs?: StrapiFooterFollowUs | null;
}

/** Global default SEO (Strapi single type component on global) */
export interface StrapiDefaultSeo {
  id: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  shareImage?: StrapiMedia | null;
}

export interface StrapiGlobal {
  id: number;
  documentId: string;
  siteName: string;
  siteDescription: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  topHeader: StrapiTopHeader;
  header?: StrapiHeader;
  footer?: StrapiFooter;
  defaultSeo?: StrapiDefaultSeo | null;
  /** Optional: locales from Strapi (otherwise use default list) */
  languages?: StrapiLocale[];
}

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  [key: string]: unknown;
}

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: StrapiMeta;
}

/** Query params for populating relations */
export type StrapiPopulate = string | string[] | Record<string, unknown>;

/** Slide link (optional CTA) */
export interface StrapiSlideLink {
  id: number;
  title: string | null;
  url: string | null;
  isExternal: boolean;
}

/** Media for slide (image or video); width/height can be null for video */
export interface StrapiSlideMedia {
  id: number;
  name: string;
  url: string;
  mime: string;
  width?: number | null;
  height?: number | null;
  alternativeText?: string | null;
  formats?: StrapiMedia["formats"];
  [key: string]: unknown;
}

/** Single slide in a slider */
export interface StrapiSlide {
  id: number;
  heading: string | null;
  subHeading: string | null;
  media: StrapiSlideMedia | null;
  link: StrapiSlideLink | null;
}

/** Blocks component: components.slides */
export interface StrapiSlidesBlock {
  __component: "components.slides";
  id: number;
  slides: StrapiSlide[];
}

/** Contact block link (phone, email) */
export interface StrapiContactLink {
  id: number;
  title: string;
  url: string;
  icon?: StrapiIcon;
}

/** Blocks component: components.contact */
export interface StrapiContactBlock {
  __component: "components.contact";
  id: number;
  title: string;
  address?: string | null;
  description?: string | null;
  link?: StrapiContactLink[];
  socialLinks?: StrapiSocialIcon[];
  contactForm?: unknown;
}

/** Home page block union */
export type StrapiHomePageBlock = StrapiSlidesBlock | StrapiContactBlock;

/** Strapi rich text inline child (text with optional formatting) */
export interface StrapiRichTextChild {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
}

/** Strapi rich text node (block content): paragraph, heading, list, list-item, quote, code, image, link */
export interface StrapiRichTextNode {
  type: string;
  level?: number | string;
  format?: "ordered" | "unordered" | "bullet";
  children?: StrapiRichTextChild[] | StrapiRichTextNode[];
  text?: string;
  url?: string;
  /** Image block: image relation or flat url/alternativeText */
  image?: { url: string; alternativeText?: string | null; width?: number; height?: number };
  [key: string]: unknown;
}

/** Page card (icon, title, description) */
export interface StrapiPageCard {
  id: number;
  icon?: StrapiIcon;
  title: string;
  description: string;
}

export interface StrapiLink {
  id: number;
  title: string | null;
  url: string | null;
  isExternal: boolean;
}

/** Dynamic page (collection type) */
export interface StrapiPage {
  id: number;
  documentId: string;
  title: string;
  subTitle?: string | null;
  slug: string;
  seo?: StrapiDefaultSeo | null;
  richText?: StrapiRichTextNode[];
  quote?: string | null;
  heading?: string | null;
  subHeading?: string | null;
  banner?: StrapiMedia | null;
  slides?: StrapiSlide[];
  /** Dynamic zones: shared.rich-text, shared.quote, shared.media */
  blocks?: StrapiDynamicBlock[];
  cards?: StrapiPageCard[];
  media?: StrapiMedia | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

/** Contact page single type */
export interface StrapiContactPage {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  banner?: StrapiMedia[] | StrapiMedia | null;
  seo?: StrapiDefaultSeo | null;
  mapEmbedLink?: string | null;
  phoneNumber?: string | null;
  emailAddress?: string | null;
  socialLinks?: StrapiSocialIcon[];
  address?: {
    id: number;
    street?: string | null;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
  } | null;
}

/** Home page about section (embedded in single type) */
export interface StrapiHomeAboutSection {
  id: number;
  title: string;
  subTitle?: string | null;
  description?: string | null;
  image?: StrapiMedia | null;
}

/** Home featured video (collection relation on api/home) */
export type StrapiHomeVideoType = "URL" | "FILE";

export interface StrapiHomeVideo {
  id: number;
  documentId: string;
  type: StrapiHomeVideoType;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  videoURL?: string | null;
  thumbnail?: StrapiMedia | null;
  videoFile?: StrapiMedia | null;
}

/** Home page single type (api/home) */
export interface StrapiHomePage {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  /** Home SEO (same shape as global defaultSeo); metadata merges this over defaultSeo */
  seo?: StrapiDefaultSeo | null;
  /** Populated video entry (URL = external embed, FILE = uploaded media) */
  video?: StrapiHomeVideo | null;
  /** @deprecated use `video` relation */
  videoURL?: string | null;
  slides?: StrapiSlide[];
  articles?: StrapiArticle[];
  aboutSection?: StrapiHomeAboutSection | null;
  projects?: StrapiProject[];
  events?: StrapiEvent[];
  /** Dynamic zones shared with the about page. */
  blocks?: StrapiAboutBlock[];
}

/** Article block: shared.media */
export interface StrapiArticleMediaBlock {
  __component: "shared.media";
  id: number;
  file: StrapiMedia | null;
}

/** Article block: shared.quote */
export interface StrapiArticleQuoteBlock {
  __component: "shared.quote";
  id: number;
  title?: string;
  body: string;
}

/** Article block: shared.rich-text (body can be Blocks array or null) */
export interface StrapiArticleRichTextBlock {
  __component: "shared.rich-text";
  id: number;
  body: StrapiRichTextNode[] | string | null;
}

/** Article block: shared.slider */
export interface StrapiArticleSliderBlock {
  __component: "shared.slider";
  id: number;
  heading: string | null;
  subHeading: string | null;
  media: StrapiMedia | null;
  link: { id: number; title: string; url: string; isExternal: boolean } | null;
}

export type StrapiArticleBlock =
  | StrapiArticleMediaBlock
  | StrapiArticleQuoteBlock
  | StrapiArticleRichTextBlock
  | StrapiArticleSliderBlock;

/** Article category */
export interface StrapiArticleCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  articles?: { id: number; slug: string; title: string }[];
  events?: { id: number; slug: string; title: string }[];
}

/** About page card (mission, vision, values) */
export interface StrapiAboutCard {
  id: number;
  icon?: StrapiIcon;
  title: string;
  description: string;
}

/** About block: components.about-organization */
export interface StrapiAboutOrganizationBlock {
  __component: "components.about-organization";
  id: number;
  title: string;
  cards: StrapiAboutCard[];
}

export interface StrapiAboutContentBlock {
  __component: "section.content";
  id: number;
  title?: string | null;
  subTitle?: string | null;
  content?: StrapiRichTextNode[] | null;
  imagePosition?: "left" | "right" | null;
  image?: StrapiMedia | null;
  link?: StrapiLink | null;
}

export interface StrapiAboutGalleryBlock {
  __component: "section.gallery";
  id: number;
  title?: string | null;
  items?: StrapiMedia[];
}

export interface StrapiAboutStatsBlock {
  __component: "section.stats";
  id: number;
  stats?: {
    id: number;
    number: number;
    label: string;
    suffix?: string | null;
  }[];
}

export interface StrapiAboutTestimonialsBlock {
  __component: "section.testimonials";
  id: number;
  title?: string | null;
  testimonials?: {
    id: number;
    quote: string;
    author?: string | null;
    role?: string | null;
    rating?: number | null;
    avatar?: StrapiMedia | null;
  }[];
}

export interface StrapiAboutCtaBlock {
  __component: "section.cta";
  id: number;
  title?: string | null;
  description?: string | null;
  link?: StrapiLink | null;
  backgroundImage?: StrapiMedia | null;
}

export interface StrapiAboutFeaturesBlock {
  __component: "section.features";
  id: number;
  title?: string | null;
  subTitle?: string | null;
  features?: {
    id: number;
    icon?: StrapiIcon | null;
    title: string;
    description?: string | null;
    link?: StrapiLink | null;
  }[];
}

export interface StrapiAboutAccordionsBlock {
  __component: "section.accordions";
  id: number;
  title?: string | null;
  items?: {
    id: number;
    question: string;
    answer?: StrapiRichTextNode[] | null;
  }[];
}

export type StrapiVideoProvider = "youtube" | "vimeo" | "direct" | "other";
export type StrapiVideoLayout = "full-width" | "contained" | "background";

export interface StrapiAboutVideoSectionBlock {
  __component: "section.video-section";
  id: number;
  title?: string | null;
  subTitle?: string | null;
  layout?: StrapiVideoLayout | null;
  video?: {
    id: number;
    title?: string | null;
    url?: string | null;
    provider?: StrapiVideoProvider | null;
    thumbnail?: StrapiMedia | null;
  } | null;
}

export interface StrapiAboutCardsBlock {
  __component: "section.cards";
  id: number;
  title?: string | null;
  subTitle?: string | null;
  cards?: {
    id: number;
    title: string;
    description?: string | null;
    badge?: string | null;
    link?: StrapiLink | null;
    image?: StrapiMedia | null;
  }[];
}

export interface StrapiAboutMediaBlock {
  __component: "shared.media";
  id: number;
  type?: "video" | "audio" | "image" | null;
  file: StrapiMedia | null;
}

export interface StrapiAboutQuoteBlock {
  __component: "shared.quote";
  id: number;
  body: string;
}

export interface StrapiAboutRichTextBlock {
  __component: "shared.rich-text";
  id: number;
  body: StrapiRichTextNode[] | null;
}

export type StrapiTabVariant = "underline" | "pills" | "boxed" | "vertical";
export type StrapiTabAlignment = "left" | "center" | "full-width";

export interface StrapiFeaturedCard {
  id: number;
  icon?: StrapiIcon | null;
  title?: string | null;
  description?: string | null;
  link?: StrapiLink | null;
}

export interface StrapiTabTextContent {
  id: number;
  body?: StrapiRichTextNode[] | null;
}

export interface StrapiTabItem {
  id: number;
  label: string;
  icon?: StrapiIcon | null;
  featuredCard?: StrapiFeaturedCard[];
  link?: StrapiLink[];
  textContent?: StrapiTabTextContent[];
}

export interface StrapiTabSectionBlock {
  __component: "section.tab-section";
  id: number;
  title?: string | null;
  subTitle?: string | null;
  defaultActiveTab?: number | null;
  variant?: StrapiTabVariant | null;
  alignment?: StrapiTabAlignment | null;
  tabs?: StrapiTabItem[];
}

export type StrapiAboutBlock =
  | StrapiAboutOrganizationBlock
  | StrapiAboutContentBlock
  | StrapiAboutGalleryBlock
  | StrapiAboutStatsBlock
  | StrapiAboutTestimonialsBlock
  | StrapiAboutCtaBlock
  | StrapiAboutFeaturesBlock
  | StrapiAboutAccordionsBlock
  | StrapiAboutVideoSectionBlock
  | StrapiAboutCardsBlock
  | StrapiAboutMediaBlock
  | StrapiAboutQuoteBlock
  | StrapiAboutRichTextBlock
  | StrapiSlidesBlock
  | StrapiArticleSliderBlock
  | StrapiTabSectionBlock;

/** Shared dynamic-zone block union across About/Home/Articles/Pages/Projects */
export type StrapiDynamicBlock = StrapiAboutBlock;

/** Donate page single type */
export interface StrapiDonatePage {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  title?: string | null;
  banner?: StrapiMedia | null;
  seo?: StrapiDefaultSeo | null;
  blocks?: StrapiDynamicBlock[];
}

/** About page single type */
export interface StrapiAboutPage {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  banner?: StrapiMedia | null;
  seo?: StrapiDefaultSeo | null;
  blocks?: StrapiAboutBlock[];
  /** @deprecated legacy Strapi media field */
  video?: StrapiMedia | null;
  /** @deprecated legacy typo in older Strapi schema */
  bocks?: StrapiAboutOrganizationBlock[];
}

/** Project block: shared.media (file can be image or video) */
export interface StrapiProjectMediaBlock {
  __component: "shared.media";
  id: number;
  file: StrapiMedia | null;
}

/** Project block: shared.quote (body only) */
export interface StrapiProjectQuoteBlock {
  __component: "shared.quote";
  id: number;
  body: string;
}

/** Project block: shared.rich-text (body is Strapi block content array) */
export interface StrapiProjectRichTextBlock {
  __component: "shared.rich-text";
  id: number;
  body: StrapiRichTextNode[];
}

export type StrapiProjectBlock =
  | StrapiProjectMediaBlock
  | StrapiProjectQuoteBlock
  | StrapiProjectRichTextBlock;

/** Project (collection type) */
export interface StrapiProject {
  id: number;
  documentId: string;
  title: string;
  summary?: string | null;
  isFeatured?: boolean;
  slug: string;
  cover?: StrapiMedia | null;
  banner?: StrapiMedia | null;
  seo?: StrapiDefaultSeo | null;
  blocks?: StrapiDynamicBlock[];
  slides?: StrapiSlide[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

/** Partner (collection type) */
export interface StrapiPartner {
  id: number;
  documentId: string;
  name: string;
  website?: string | null;
  description?: string | null;
  slug: string;
  logo?: StrapiMedia | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

/** Article (news/story) */
export interface StrapiArticle {
  id: number;
  documentId: string;
  title: string;
  summary?: string | null;
  slug: string;
  isFeatured?: boolean;
  seo?: StrapiDefaultSeo | null;
  category?: StrapiArticleCategory | null;
  cover?: StrapiMedia | null;
  blocks?: StrapiDynamicBlock[];
  slides?: StrapiSlide[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type StrapiEventStatus = "upcoming" | "ongoing" | "past" | "cancelled" | "draft";

export interface StrapiEventLocation {
  id: number;
  street?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
}

export interface StrapiEventSpeaker {
  id: number;
  name: string;
  role?: string | null;
  bio?: string | null;
  photo?: StrapiMedia | null;
  socialLinks?: StrapiSocialIcon[];
}

export interface StrapiEventOrganizer {
  id: number;
  documentId?: string;
  fullName: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: StrapiRichTextNode[] | null;
  message?: string | null;
  slug?: string | null;
  photo?: StrapiMedia | null;
  socialLinks?: StrapiSocialIcon[];
}

export interface StrapiEvent {
  id: number;
  documentId: string;
  title: string;
  summary?: string | null;
  description?: StrapiRichTextNode[] | null;
  slug: string;
  isFeatured?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  timeZone?: string | null;
  eventStatus?: StrapiEventStatus | string | null;
  cover?: StrapiMedia | null;
  seo?: StrapiDefaultSeo | null;
  organizer?: StrapiEventOrganizer | null;
  location?: StrapiEventLocation | null;
  speakers?: StrapiEventSpeaker[];
  category?: StrapiArticleCategory | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

/** Board member (team/leadership) */
export interface StrapiBoardMember {
  id: number;
  documentId: string;
  fullName: string;
  title: string | null;
  role: string | null;
  slug: string;
  email: string | null;
  phone: string | null;
  bio: StrapiRichTextNode[] | null;
  message: string | null;
  photo: StrapiMedia | null;
  socialLinks: StrapiSocialIcon[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
