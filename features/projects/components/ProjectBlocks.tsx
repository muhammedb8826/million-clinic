import Image from "next/image";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiProjectBlock } from "@/lib/strapi";
import { RichTextContent } from "@/features/pages";

function BlockMedia({ block }: { block: { file: unknown } }) {
  const file = resolveStrapiMedia(block.file) ?? (block.file as { url?: string; mime?: string });
  const url = file?.url ? getStrapiMediaUrl(file.url) : "";
  if (!url) return null;

  const mime = (file as { mime?: string })?.mime;
  const isVideo = typeof mime === "string" && mime.startsWith("video/");

  if (isVideo) {
    return (
      <div className="my-6 overflow-hidden rounded-lg bg-secondary">
        <video className="w-full" src={url} controls playsInline preload="metadata" aria-label="Project media">
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="relative my-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
      <Image
        src={url}
        alt={(file as { alternativeText?: string })?.alternativeText ?? ""}
        fill
        className="object-cover"
        sizes="100vw"
      />
    </div>
  );
}

function BlockQuote({ block }: { block: { body: string } }) {
  if (!block.body?.trim()) return null;
  return (
    <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
      <p>{block.body}</p>
    </blockquote>
  );
}

interface ProjectBlocksProps {
  blocks: StrapiProjectBlock[];
}

export function ProjectBlocks({ blocks }: ProjectBlocksProps) {
  if (!blocks?.length) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const key = `${block.__component}-${block.id}-${index}`;
        switch (block.__component) {
          case "shared.media":
            return <BlockMedia key={key} block={block} />;
          case "shared.quote":
            return <BlockQuote key={key} block={block} />;
          case "shared.rich-text":
            return (
              <div key={key} className="my-6">
                <RichTextContent content={Array.isArray(block.body) ? block.body : []} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
