import Image from "next/image";
import type { StrapiRichTextNode, StrapiRichTextChild } from "@/lib/strapi";
import { getStrapiMediaUrl } from "@/lib/strapi";

type InlineChild = StrapiRichTextChild | StrapiRichTextNode;

function renderInlineChildren(children: InlineChild[] | undefined): React.ReactNode {
  if (!children?.length) return null;
  return children.map((child, i) => {
    if (child.type === "text") {
      const text = (child as StrapiRichTextChild).text ?? "";
      let node: React.ReactNode = text;
      if ((child as StrapiRichTextChild).bold) node = <strong>{node}</strong>;
      if ((child as StrapiRichTextChild).italic) node = <em>{node}</em>;
      if ((child as StrapiRichTextChild).underline) node = <span className="underline">{node}</span>;
      if ((child as StrapiRichTextChild).strikethrough) node = <s>{node}</s>;
      if ((child as StrapiRichTextChild).code) node = <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{node}</code>;
      return <span key={i}>{node}</span>;
    }
    if (child.type === "link") {
      const url = (child as StrapiRichTextNode).url ?? "#";
      const href = url.startsWith("http") || url.startsWith("/") ? url : `https://${url}`;
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-90">
          {renderInlineChildren((child as StrapiRichTextNode).children as InlineChild[])}
        </a>
      );
    }
    return null;
  });
}

function renderChildren(children: InlineChild[] | undefined): React.ReactNode {
  return renderInlineChildren(children);
}

function isEmptyContent(children: InlineChild[] | undefined): boolean {
  if (!children?.length) return true;
  return children.every((c) => c.type === "text" && !((c as StrapiRichTextChild).text ?? "").trim());
}

interface RichTextContentProps {
  content: StrapiRichTextNode[] | null | undefined;
  className?: string;
}

export function RichTextContent({ content, className = "" }: RichTextContentProps) {
  if (!content?.length) return null;

  return (
    <div className={`prose prose-neutral dark:prose-invert max-w-none text-foreground ${className}`}>
      {content.map((node, i) => {
        if (node.type === "heading") {
          const rawLevel = typeof node.level === "string" ? Number(node.level) : node.level;
          const level = Number.isFinite(rawLevel) && rawLevel! >= 1 && rawLevel! <= 6 ? Math.floor(rawLevel!) : 2;
          const children = renderChildren(node.children as InlineChild[]);
          const sizeClass =
            level === 1
              ? "text-3xl sm:text-4xl"
              : level === 2
                ? "text-2xl sm:text-3xl"
                : level === 3
                  ? "text-xl sm:text-2xl"
                  : level === 4
                    ? "text-lg sm:text-xl"
                    : "text-base sm:text-lg";
          const headingClass = `mt-8 mb-3 first:mt-0 font-bold tracking-tight text-foreground ${sizeClass}`;
          const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
          return (
            <Tag key={i} className={headingClass}>
              {children}
            </Tag>
          );
        }
        if (node.type === "paragraph") {
          if (isEmptyContent(node.children as InlineChild[])) return null;
          const text = renderChildren(node.children as InlineChild[]);
          return (
            <p key={i} className="mb-4 text-base leading-relaxed text-muted-foreground">
              {text}
            </p>
          );
        }
        if (node.type === "quote") {
          const text = renderChildren(node.children as InlineChild[]);
          if (!text) return null;
          return (
            <blockquote key={i} className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
              {text}
            </blockquote>
          );
        }
        if (node.type === "list") {
          const listChildren = node.children as StrapiRichTextNode[] | undefined;
          if (!listChildren?.length) return null;
          const format = node.format ?? "unordered";
          const isOrdered = format === "ordered";
          const ListTag = isOrdered ? "ol" : "ul";
          const listClass = isOrdered ? "list-decimal" : "list-disc";
          return (
            <ListTag key={i} className={`my-4 ml-6 ${listClass} space-y-1 text-muted-foreground`}>
              {listChildren.map((item, j) => {
                if (item.type !== "list-item") return null;
                return (
                  <li key={j} className="leading-relaxed">
                    {renderChildren(item.children as InlineChild[])}
                  </li>
                );
              })}
            </ListTag>
          );
        }
        if (node.type === "code") {
          const codeChildren = node.children as InlineChild[] | undefined;
          const text = (codeChildren?.map((c) => (c.type === "text" ? (c as StrapiRichTextChild).text ?? "" : "")).join("")) ?? (node as { text?: string }).text ?? "";
          if (!text.trim()) return null;
          return (
            <pre key={i} className="my-6 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm">
              <code className="font-mono text-foreground">{text}</code>
            </pre>
          );
        }
        if (node.type === "image") {
          const img = node.image ?? (node as { url?: string; alternativeText?: string | null });
          const url = img?.url ? getStrapiMediaUrl(img.url) : "";
          if (!url) return null;
          const alt = (img as { alternativeText?: string | null })?.alternativeText ?? "";
          return (
            <figure key={i} className="my-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={url}
                  alt={alt || " "}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
              {alt && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{alt}</figcaption>}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
}
