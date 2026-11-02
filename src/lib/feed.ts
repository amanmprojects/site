import type { PostMeta } from "@/lib/posts";
import { site } from "@/lib/site";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00Z`).toUTCString();
}

/** RSS 2.0 for the given posts, which should already be newest-first. */
export function buildFeed(posts: PostMeta[]): string {
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${site.url}${post.href}</link>
      <guid isPermaLink="true">${site.url}${post.href}</guid>
      <pubDate>${rfc822(post.dateISO)}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`,
    )
    .join("\n");

  const lastBuild = posts[0]
    ? `\n    <lastBuildDate>${rfc822(posts[0].dateISO)}</lastBuildDate>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en-us</language>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />${lastBuild}
${items}
  </channel>
</rss>
`;
}
