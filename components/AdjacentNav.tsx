import Link from "next/link";

export type AdjacentLink = {
  href: string;
  label: string;
};

interface AdjacentNavProps {
  previous?: AdjacentLink | null;
  next?: AdjacentLink | null;
  previousCaption?: string;
  nextCaption?: string;
}

export function AdjacentNav({
  previous,
  next,
  previousCaption = "Previous",
  nextCaption = "Next",
}: AdjacentNavProps) {
  if (!previous && !next) return null;

  return (
    <nav
      className="mt-14 grid gap-4 border-t border-border pt-10 sm:grid-cols-2"
      aria-label="Adjacent items"
    >
      {previous ? (
        <Link
          href={previous.href}
          rel="prev"
          className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            ← {previousCaption}
          </span>
          <span className="font-semibold text-foreground transition group-hover:text-primary">
            {previous.label}
          </span>
        </Link>
      ) : (
        <div aria-hidden className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={next.href}
          rel="next"
          className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-5 text-right transition hover:border-primary/40 hover:shadow-sm sm:ml-auto sm:items-end"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {nextCaption} →
          </span>
          <span className="font-semibold text-foreground transition group-hover:text-primary">
            {next.label}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
