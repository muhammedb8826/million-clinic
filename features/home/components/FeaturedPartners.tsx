import Link from "next/link";
import type { StrapiPartner } from "@/lib/strapi";
import { PartnerCard } from "@/features/partners";

interface FeaturedPartnersProps {
  partners: StrapiPartner[];
}

/** Build two identical halves for seamless CSS translateX(-50%) marquee. */
function marqueeSequence(partners: StrapiPartner[]): StrapiPartner[] {
  if (partners.length === 0) return [];
  const minHalf = 10;
  const half: StrapiPartner[] = [];
  for (let i = 0; i < minHalf; i++) {
    half.push(partners[i % partners.length]);
  }
  return [...half, ...half];
}

export function FeaturedPartners({ partners }: FeaturedPartnersProps) {
  if (partners.length === 0) return null;

  const track = marqueeSequence(partners);

  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-col gap-3 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Partners
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by organizations we work with
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We collaborate with local and international partners to maximize impact.
          </p>
        </div>

        <div className="relative overflow-hidden py-2">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-muted/80 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-muted/80 to-transparent"
            aria-hidden
          />
          <div className="partners-marquee-track flex-nowrap">
            {track.map((partner, index) => (
              <div key={`${partner.id}-${index}`} className="shrink-0 px-3 py-1">
                <PartnerCard partner={partner} className="h-[88px] w-[200px]" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            View all partners
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
