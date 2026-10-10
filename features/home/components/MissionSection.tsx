import Image from "next/image";
import Link from "next/link";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiHomeAboutSection } from "@/lib/strapi";

interface MissionSectionProps {
  siteName?: string;
  siteDescription?: string;
  /** When provided, overrides siteName/siteDescription and shows title, subTitle, description, optional image */
  aboutSection?: StrapiHomeAboutSection | null;
}

export function MissionSection({ siteName, siteDescription, aboutSection }: MissionSectionProps) {
  const useAbout = aboutSection && (aboutSection.title || aboutSection.subTitle || aboutSection.description);
  const title = useAbout ? (aboutSection.title ?? "") : (siteName ? `Together with ${siteName}` : "Making a Difference Together");
  const subTitle = useAbout ? aboutSection.subTitle : undefined;
  const description = useAbout ? aboutSection.description : (siteDescription ?? "We believe in the power of community and compassion. Every action counts, every voice matters. Join us in creating lasting change.");
  const media = useAbout && aboutSection?.image ? resolveStrapiMedia(aboutSection.image) ?? aboutSection.image : null;
  const imageUrl = media?.url ? getStrapiMediaUrl(media.url) : "";

  return (
    <section className="relative overflow-hidden bg-muted/50 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,0,0,0.03),transparent)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.05),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className={`flex flex-col gap-10 md:flex-row md:items-center ${imageUrl ? "md:gap-12" : ""}`}>
          {imageUrl && (
            <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-2xl bg-muted md:max-w-md">
              <Image
                src={imageUrl}
                alt={(media as { alternativeText?: string })?.alternativeText ?? aboutSection?.title ?? "About us"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            {subTitle && (
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {subTitle}
              </p>
            )}
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
            <div className="mt-6 flex justify-center md:justify-start">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                See more
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
