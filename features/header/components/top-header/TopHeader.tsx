import type { StrapiTopHeader } from "@/lib/strapi";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { TopHeaderCtaLink } from "./TopHeaderCtaLink";

function ensureUrl(url: string | null | undefined): string {
  if (url == null || typeof url !== "string" || !url.trim()) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

interface TopHeaderProps {
  data: StrapiTopHeader | null;
}

export function TopHeader({ data }: TopHeaderProps) {
  const socialIcons = data?.socialIcon ?? [];
  const ctas = data?.cta ?? [];

  return (
    <header className="relative z-50 hidden border-b border-border bg-muted md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        {ctas.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {ctas.map((item) => (
              <TopHeaderCtaLink key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-4">
          {socialIcons.length > 0 && (
            <div className="flex items-center gap-4">
              {socialIcons.map((item) => (
                <a
                  key={item.id}
                  href={ensureUrl(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition hover:text-primary"
                  aria-label={item.icon?.iconName ?? "Social link"}
                >
                  <svg
                    className="inline-block"
                    width={item.icon?.width ?? 24}
                    height={item.icon?.height ?? 24}
                    viewBox={`0 0 ${item.icon?.width ?? 24} ${item.icon?.height ?? 24}`}
                    fill="currentColor"
                    dangerouslySetInnerHTML={{ __html: item.icon?.iconData ?? "" }}
                  />
                </a>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <LanguageSwitcher locales={data?.languages} />
          </div>
        </div>
      </div>
    </header>
  );
}
