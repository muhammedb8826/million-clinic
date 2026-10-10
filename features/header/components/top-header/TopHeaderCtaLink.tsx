import type { StrapiTopHeaderCta } from "@/lib/strapi";

function ensureUrl(url: string | null | undefined): string {
  if (url == null || typeof url !== "string" || !url.trim()) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function contactLinkHref(url: string): string {
  const trimmed = url.trim();
  if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return trimmed;
  if (/@/.test(trimmed) && !trimmed.includes(":")) return `mailto:${trimmed}`;
  if (/^[\d\s\-+()]+$/.test(trimmed.replace(/\s/g, ""))) return `tel:${trimmed}`;
  return ensureUrl(trimmed);
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

interface TopHeaderCtaLinkProps {
  item: StrapiTopHeaderCta;
  className?: string;
}

export function TopHeaderCtaLink({ item, className = "" }: TopHeaderCtaLinkProps) {
  const href = contactLinkHref(item.url);
  const external = isExternalHref(href);

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary ${className}`.trim()}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {item.icon?.iconData && (
        <svg
          className="shrink-0"
          width={item.icon.width ?? 18}
          height={item.icon.height ?? 18}
          viewBox={`0 0 ${item.icon.width ?? 18} ${item.icon.height ?? 18}`}
          fill="currentColor"
          aria-hidden
          dangerouslySetInnerHTML={{ __html: item.icon.iconData }}
        />
      )}
      <span>{item.title}</span>
    </a>
  );
}
