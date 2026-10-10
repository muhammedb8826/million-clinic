import Image from "next/image";
import Link from "next/link";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiPartner } from "@/lib/strapi";

interface PartnerCardProps {
  partner: StrapiPartner;
  className?: string;
}

export function PartnerCard({ partner, className }: PartnerCardProps) {
  const logo = resolveStrapiMedia(partner.logo) ?? partner.logo;
  const logoUrl = logo?.url ? getStrapiMediaUrl(logo.url) : "";
  const alt = (logo as { alternativeText?: string | null })?.alternativeText ?? partner.name;

  return (
    <Link
      href={`/partners/${partner.slug}`}
      className={`group flex items-center justify-center rounded-xl border border-border bg-card p-4 transition hover:border-primary hover:shadow-sm ${className ?? ""}`}
      aria-label={partner.name}
    >
      {logoUrl ? (
        <div className="relative h-16 w-full max-w-[180px]">
          <Image
            src={logoUrl}
            alt={alt}
            fill
            className="object-contain opacity-95 transition group-hover:opacity-100"
            sizes="180px"
          />
        </div>
      ) : (
        <span className="text-sm font-semibold text-muted-foreground">{partner.name}</span>
      )}
    </Link>
  );
}

