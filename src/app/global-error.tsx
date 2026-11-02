"use client";

/**
 * Root error boundary. Replaces the root layout when active, so it must
 * define its own <html> and <body>. Also works around a Turbopack bug where
 * the built-in global-error module is missing from the React Client Manifest.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" style={{ colorScheme: "light dark" }}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          background: "light-dark(#fbfbf9, #131311)",
          color: "light-dark(#15171c, #ececea)",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p
            style={{
              color: "light-dark(#6b7280, #9a9ea6)",
              margin: "0 0 20px",
              lineHeight: 1.5,
            }}
          >
            {error.digest
              ? "A server error occurred. Try again, or reload the page."
              : "Try again, or reload the page."}
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              background: "light-dark(#255ce6, #7aa2ff)",
              color: "light-dark(#fbfbf9, #131311)",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
