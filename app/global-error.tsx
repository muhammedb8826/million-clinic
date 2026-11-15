"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Inline styles only — avoid theme/CSS-variable context during prerender
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#111",
        }}
      >
        <main
          style={{
            margin: "0 auto",
            display: "flex",
            minHeight: "100vh",
            maxWidth: "42rem",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 1.5rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#666" }}>
            Please try again. If the problem persists, refresh the page.
          </p>
          {error?.digest ? (
            <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#666" }}>
              Error ID: {error.digest}
            </p>
          ) : null}
          <div style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                border: "none",
                borderRadius: "0.375rem",
                background: "#111",
                color: "#fff",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                borderRadius: "0.375rem",
                border: "1px solid #ddd",
                background: "#fff",
                color: "#111",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload page
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
