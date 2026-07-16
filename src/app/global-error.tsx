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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fbfbf9",
          color: "#15171c",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280", margin: "0 0 20px", lineHeight: 1.5 }}>
            {error.digest
              ? "A server error occurred. Try again, or reload the page."
              : "Try again, or reload the page."}
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              background: "#2f6bff",
              color: "#fff",
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
