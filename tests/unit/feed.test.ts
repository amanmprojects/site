import { describe, expect, it } from "vitest";
import { buildFeed, escapeXml } from "@/lib/feed";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import { site } from "@/lib/site";

/** Fails on unclosed or crossed tags; enough to catch broken templating. */
function assertBalancedXml(xml: string) {
  const stack: string[] = [];
  const body = xml.replace(/<\?xml[^>]*\?>/, "");
  for (const [tag, closing, name, selfClosing] of body.matchAll(
    /<(\/?)([a-zA-Z:]+)[^>]*?(\/?)>/g,
  )) {
    if (selfClosing) continue;
    if (closing) {
      expect(stack.pop(), `unexpected ${tag}`).toBe(name);
    } else {
      stack.push(name);
    }
  }
  expect(stack).toEqual([]);
}

describe("escapeXml", () => {
  it("escapes all five XML special characters", () => {
    expect(escapeXml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;",
    );
  });
});

describe("buildFeed", () => {
  it("lists every published post with an absolute link", () => {
    const posts = getAllPosts();
    const xml = buildFeed(posts);
    assertBalancedXml(xml);
    expect(xml.match(/<item>/g)).toHaveLength(posts.length);
    for (const post of posts) {
      expect(xml).toContain(`<link>${site.url}${post.href}</link>`);
    }
  });

  it("declares its own URL and newest date", () => {
    const xml = buildFeed(getAllPosts());
    expect(xml).toContain(
      `<atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />`,
    );
    expect(xml).toMatch(/<lastBuildDate>\w{3}, \d{2} \w{3} \d{4} 00:00:00 GMT<\/lastBuildDate>/);
  });

  it("escapes hostile titles and excerpts", () => {
    const post: PostMeta = {
      slug: "x",
      title: "</title><script>",
      date: "",
      dateISO: "2026-01-02",
      excerpt: "a & b",
      href: "/writing/x",
      readingMinutes: 1,
    };
    const xml = buildFeed([post]);
    assertBalancedXml(xml);
    expect(xml).toContain("<title>&lt;/title&gt;&lt;script&gt;</title>");
    expect(xml).toContain("<pubDate>Fri, 02 Jan 2026 00:00:00 GMT</pubDate>");
  });

  it("is still valid with no posts", () => {
    const xml = buildFeed([]);
    assertBalancedXml(xml);
    expect(xml).not.toContain("<item>");
    expect(xml).not.toContain("lastBuildDate");
  });
});
