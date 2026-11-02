import { ImageResponse } from "next/og";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { site } from "@/lib/site";

export const alt = `Article by ${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

/** Long titles step down so they fit in three lines. */
function titleSize(title: string): number {
  if (title.length > 80) return 52;
  if (title.length > 50) return 60;
  return 72;
}

export default async function PostOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? site.name;

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
          {site.name} · Writing
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize(title),
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 28,
            width: "100%",
          }}
        >
          <div
            style={{
              background: "#2f6bff",
              display: "flex",
              height: 8,
              width: 180,
            }}
          />
          {post && (
            <div style={{ color: "#6b7280", display: "flex", fontSize: 28 }}>
              {post.date} · {post.readingMinutes} min read
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
