"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please try again. If the problem persists, refresh the page.
          </p>
          {error?.digest && (
            <p className="mt-3 text-xs text-muted-foreground">Error ID: {error.digest}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              Reload page
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

