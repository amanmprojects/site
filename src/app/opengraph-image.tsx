import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} - AI and software engineering portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-start",
          background: "#fbfbf9",
          color: "#15171c",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 80px",
          width: "100%",
        }}
      >
        <div style={{ color: "#2f6bff", display: "flex", fontSize: 30 }}>
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.08,
              maxWidth: 980,
            }}
          >
            AI, systems, and tools that ship.
          </div>
          <div
            style={{
              color: "#6b7280",
              display: "flex",
              fontSize: 30,
              marginTop: 28,
            }}
          >
            Engineering · Products · Writing
          </div>
        </div>
        <div
          style={{
            background: "#2f6bff",
            display: "flex",
            height: 8,
            width: 180,
          }}
        />
      </div>
    ),
    size,
  );
}
