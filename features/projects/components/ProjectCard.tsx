import Image from "next/image";
import Link from "next/link";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiProject } from "@/lib/strapi";

interface ProjectCardProps {
  project: StrapiProject;
}

function getProjectImage(project: StrapiProject): { url: string; alt: string } | null {
  const cover = resolveStrapiMedia(project.cover) ?? project.cover;
  if (cover?.url) {
    const url = getStrapiMediaUrl(cover.url);
    if (url) return { url, alt: (cover as { alternativeText?: string })?.alternativeText ?? project.title };
  }
  const banner = resolveStrapiMedia(project.banner) ?? project.banner;
  if (banner?.url) {
    const url = getStrapiMediaUrl(banner.url);
    if (url) return { url, alt: (banner as { alternativeText?: string })?.alternativeText ?? project.title };
  }
  for (const block of project.blocks ?? []) {
    if (block.__component === "shared.media" && "file" in block && block.file) {
      const file = resolveStrapiMedia(block.file) ?? block.file;
      const mime = (file as { mime?: string })?.mime;
      if (typeof mime === "string" && mime.startsWith("image/")) {
        const url = file?.url ? getStrapiMediaUrl(file.url) : "";
        if (url) return { url, alt: (file as { alternativeText?: string })?.alternativeText ?? project.title };
      }
    }
  }
  for (const slide of project.slides ?? []) {
    const media = resolveStrapiMedia(slide.media) ?? slide.media;
    const mime = (media as { mime?: string })?.mime;
    if (media?.url && typeof mime === "string" && mime.startsWith("image/")) {
      const url = getStrapiMediaUrl(media.url);
      if (url) return { url, alt: project.title };
    }
  }
  return null;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const image = getProjectImage(project);
  const summary = project.summary?.trim();
  const excerpt = summary ? (summary.length > 140 ? `${summary.slice(0, 140)}…` : summary) : "";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary hover:shadow-md"
    >
      {image && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {project.isFeatured && (
            <span className="absolute left-2 top-2 rounded bg-tertiary px-2 py-0.5 text-xs font-medium text-tertiary-foreground">
              Featured
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        {!image && project.isFeatured && (
          <span className="mb-2 inline-block rounded bg-tertiary/20 px-2 py-0.5 text-xs font-medium text-tertiary">
            Featured
          </span>
        )}
        <h2 className="mb-2 font-semibold text-foreground transition group-hover:text-primary">
          {project.title}
        </h2>
        {excerpt && (
          <p className="text-sm text-muted-foreground">{excerpt}</p>
        )}
      </div>
    </Link>
  );
}
