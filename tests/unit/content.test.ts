import { describe, expect, it } from "vitest";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/posts";
import { site } from "@/lib/site";

describe("site content", () => {
  it("keeps every story link label in its display text", () => {
    for (const item of site.story) {
      for (const link of item.links ?? []) {
        expect(item.text.toLowerCase()).toContain(link.label.toLowerCase());
      }
    }
  });

  it("keeps project links unique", () => {
    const links = site.projects.map((project) => project.href);
    expect(new Set(links).size).toBe(links.length);
  });

  it("loads published posts and rejects invalid slugs", () => {
    expect(getAllPosts()).not.toHaveLength(0);
    expect(getPostBySlug("hello-world")?.title).toBe("Hello, world");
    expect(getPostBySlug("../package")).toBeNull();
  });

  it("removes executable HTML and unsafe URLs from Markdown", () => {
    const html = renderMarkdown(
      '[safe](https://example.com) [unsafe](javascript:alert(1)) <script>alert(1)</script>',
    );

    expect(html).toContain('href="https://example.com"');
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<script");
  });
});
