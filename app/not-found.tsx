import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-muted-foreground">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Go home
          </Link>
          <Link
            href="/projects"
            className="inline-flex rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            Explore projects
          </Link>
          <Link
            href="/partners"
            className="inline-flex rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            View partners
          </Link>
        </div>
      </section>
    </main>
  );
}

