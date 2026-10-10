import Image from "next/image";
import { getStrapiMediaUrl, resolveStrapiMedia } from "@/lib/strapi";
import type { StrapiArticleBlock, StrapiArticleRichTextBlock } from "@/lib/strapi";
import { RichTextContent } from "@/features/pages";

interface ArticleBlocksProps {
  blocks: StrapiArticleBlock[];
}

function BlockMedia({ block }: { block: { file: unknown } }) {
  const file = resolveStrapiMedia(block.file) ?? (block.file as { url?: string; mime?: string });
  const url = file?.url ? getStrapiMediaUrl(file.url) : "";
  if (!url) return null;

  const mime = (file as { mime?: string })?.mime;
  const isVideo = typeof mime === "string" && mime.startsWith("video/");

  if (isVideo) {
    return (
      <div className="my-6 overflow-hidden rounded-lg bg-secondary">
        <video className="w-full" src={url} controls playsInline preload="metadata" aria-label="Article media">
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

function BlockQuote({ block }: { block: { title?: string; body: string } }) {
  return (
    <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
      {block.title && (
        <p className="mb-2 font-semibold not-italic">{block.title}</p>
      )}
      <p>{block.body}</p>
    </blockquote>
  );
}

function BlockRichText({ block }: { block: StrapiArticleRichTextBlock }) {
  const body = block.body;
  if (body == null) return null;
  const nodes = Array.isArray(body) ? body : [];
  if (nodes.length === 0) return null;
  return (
    <div className="my-6">
      <RichTextContent content={nodes} />
    </div>
  );
}

function BlockSlider({ block }: { block: { heading?: string | null; subHeading?: string | null; media?: unknown } }) {
  const media = resolveStrapiMedia(block.media);
  const url = media?.url ? getStrapiMediaUrl(media.url) : "";
  if (!url) return null;

  return (
    <div className="my-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={url}
          alt={(media as { alternativeText?: string })?.alternativeText ?? block.heading ?? ""}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        {(block.heading || block.subHeading) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-white">
            {block.heading && <h3 className="text-xl font-semibold">{block.heading}</h3>}
            {block.subHeading && <p>{block.subHeading}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ArticleBlocks({ blocks }: ArticleBlocksProps) {
  if (!blocks?.length) return null;

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const key = `${block.__component}-${block.id}-${index}`;
        switch (block.__component) {
          case "shared.media":
            return <BlockMedia key={key} block={block} />;
          case "shared.quote":
            return <BlockQuote key={key} block={block} />;
          case "shared.rich-text":
            return <BlockRichText key={key} block={block} />;
          case "shared.slider":
            return <BlockSlider key={key} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
