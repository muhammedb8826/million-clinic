import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiMedia } from "@/lib/strapi";

interface AboutVideoProps {
  video: StrapiMedia | null | undefined;
}

export function AboutVideo({ video }: AboutVideoProps) {
  const media = resolveStrapiMedia(video) ?? (video as { url?: string; mime?: string });
  const url = media?.url ? getStrapiMediaUrl(media.url) : "";
  const mime = (media as { mime?: string })?.mime;
  const isVideo = typeof mime === "string" && mime.startsWith("video/");

  if (!url || !isVideo) return null;

  return (
    <section className="bg-muted">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="overflow-hidden rounded-xl bg-secondary shadow-lg">
          <video
            className="w-full"
            src={url}
            controls
            playsInline
            preload="metadata"
            poster=""
            aria-label="About us video"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
