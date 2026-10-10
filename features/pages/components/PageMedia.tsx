import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiMedia } from "@/lib/strapi";

interface PageMediaProps {
  media: StrapiMedia | null | undefined;
}

export function PageMedia({ media }: PageMediaProps) {
  const m = resolveStrapiMedia(media) ?? (media as { url?: string; mime?: string });
  const url = m?.url ? getStrapiMediaUrl(m.url) : "";
  const mime = (m as { mime?: string })?.mime;
  const isVideo = typeof mime === "string" && mime.startsWith("video/");

  if (!url || !isVideo) return null;

  return (
    <section className="bg-muted py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="overflow-hidden rounded-xl bg-secondary shadow-lg">
          <video
            className="w-full"
            src={url}
            controls
            playsInline
            preload="metadata"
            aria-label="Page video"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
