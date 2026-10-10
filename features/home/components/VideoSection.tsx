import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiHomeVideo } from "@/lib/strapi";

/** Extract YouTube video ID from common URL formats */
function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?|$)/);
  if (shortMatch) return shortMatch[1];
  const watchMatch = trimmed.match(/(?:v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  return null;
}

function normalizeVideoType(type: StrapiHomeVideo["type"] | undefined): "URL" | "FILE" | undefined {
  if (typeof type !== "string") return undefined;
  const t = type.toUpperCase();
  if (t === "URL" || t === "FILE") return t;
  return undefined;
}

interface VideoSectionProps {
  video?: StrapiHomeVideo | null;
  /** @deprecated use `video` from Strapi home relation */
  videoURL?: string | null;
}

export function VideoSection({ video, videoURL }: VideoSectionProps) {
  const legacyId = !video ? getYouTubeVideoId(videoURL) : null;
  if (!video && legacyId) {
    const embedSrc = `https://www.youtube.com/embed/${legacyId}?rel=0`;
    return (
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
            <div className="relative aspect-video w-full">
              <iframe
                src={embedSrc}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!video) return null;

  const kind = normalizeVideoType(video.type);
  const file = resolveStrapiMedia(video.videoFile) ?? video.videoFile;
  const fileUrl = file?.url ? getStrapiMediaUrl(file.url) : "";
  const thumb = resolveStrapiMedia(video.thumbnail) ?? video.thumbnail;
  const poster = thumb?.url ? getStrapiMediaUrl(thumb.url) : undefined;
  const videoId = getYouTubeVideoId(video.videoURL);

  const header =
    (video.title || video.description) && (
      <div className="mb-6 text-center">
        {video.title && <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{video.title}</h2>}
        {video.description && <p className="mt-2 text-muted-foreground sm:text-lg">{video.description}</p>}
      </div>
    );

  if (kind === "FILE") {
    if (!fileUrl) return null;
    return (
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          {header}
          <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
            <div className="relative aspect-video w-full">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={fileUrl}
                poster={poster}
                controls
                playsInline
                preload="metadata"
                aria-label={video.title ?? "Featured video"}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (kind === "URL") {
    if (!videoId) return null;
    const embedSrc = `https://www.youtube.com/embed/${videoId}?rel=0`;
    return (
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          {header}
          <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
            <div className="relative aspect-video w-full">
              <iframe
                src={embedSrc}
                title={video.title ?? "YouTube video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (fileUrl) {
    return (
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          {header}
          <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
            <div className="relative aspect-video w-full">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={fileUrl}
                poster={poster}
                controls
                playsInline
                preload="metadata"
                aria-label={video.title ?? "Featured video"}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!videoId) return null;
  const embedSrc = `https://www.youtube.com/embed/${videoId}?rel=0`;
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4">
        {header}
        <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          <div className="relative aspect-video w-full">
            <iframe
              src={embedSrc}
              title={video.title ?? "YouTube video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
