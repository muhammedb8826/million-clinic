import Image from "next/image";
import Link from "next/link";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiTeam } from "@/lib/strapi";

interface TeamCardProps {
  member: StrapiTeam;
}

function getPhotoUrl(member: StrapiTeam): { url: string; alt: string } | null {
  const photo = resolveStrapiMedia(member.photo) ?? member.photo;
  if (photo?.url) {
    const url = getStrapiMediaUrl(photo.url);
    if (url) return { url, alt: (photo as { alternativeText?: string })?.alternativeText ?? member.fullName };
  }
  return null;
}

export function TeamCard({ member }: TeamCardProps) {
  const photo = getPhotoUrl(member);
  const role = member.role?.trim();
  const messageExcerpt = member.message?.trim()
    ? member.message.length > 120
      ? `${member.message.slice(0, 120)}…`
      : member.message
    : "";

  return (
    <Link
      href={`/teams/${member.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary hover:shadow-md"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-semibold text-muted-foreground">
            {member.fullName.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-foreground transition group-hover:text-primary">
          {member.fullName}
        </h2>
        {role && (
          <p className="mt-0.5 text-sm text-primary font-medium">{role}</p>
        )}
        {messageExcerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{messageExcerpt}</p>
        )}
      </div>
    </Link>
  );
}
