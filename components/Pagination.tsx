import Link from "next/link";

export type PaginationMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  pageCount: number;
  /** Base path, e.g. "/articles" */
  basePath: string;
  /** Extra query params to preserve (e.g. category) — page is set by this component */
  query?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  page: number,
  query?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null && value !== "") params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current]);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) result.push("ellipsis");
    result.push(sorted[i]!);
  }
  return result;
}

export function Pagination({ page, pageCount, basePath, query }: PaginationProps) {
  if (pageCount <= 1) return null;

  const current = Math.min(Math.max(1, page), pageCount);
  const pages = pageWindow(current, pageCount);

  return (
    <nav className="mt-12 flex flex-col items-center gap-4" aria-label="Pagination">
      <p className="text-sm text-muted-foreground">
        Page {current} of {pageCount}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {current > 1 ? (
          <Link
            href={buildHref(basePath, current - 1, query)}
            className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
            rel="prev"
          >
            ← Previous
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm text-muted-foreground/50">
            ← Previous
          </span>
        )}

        <div className="flex items-center gap-1">
          {pages.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`e-${index}`} className="px-2 text-sm text-muted-foreground" aria-hidden>
                …
              </span>
            ) : (
              <Link
                key={item}
                href={buildHref(basePath, item, query)}
                aria-current={item === current ? "page" : undefined}
                className={
                  item === current
                    ? "inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-primary px-2.5 text-sm font-semibold text-primary-foreground"
                    : "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border bg-card px-2.5 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
                }
              >
                {item}
              </Link>
            ),
          )}
        </div>

        {current < pageCount ? (
          <Link
            href={buildHref(basePath, current + 1, query)}
            className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
            rel="next"
          >
            Next →
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm text-muted-foreground/50">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}

/** Parse `?page=` into a positive integer (default 1). */
export function parsePageParam(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export const DEFAULT_LIST_PAGE_SIZE = 9;
