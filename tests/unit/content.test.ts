import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/posts";
import { site } from "@/lib/site";
import { splitStory } from "@/lib/story";

const postsDir = path.join(process.cwd(), "content", "writing");
const postFiles = fs
  .readdirSync(postsDir)
  .filter((f) => f.endsWith(".md") && !f.startsWith("_"));

describe("site content", () => {
  it("renders every story link label as a link", () => {
    for (const item of site.story) {
      const rendered = splitStory(item)
        .filter((s) => s.kind === "link")
        .map((s) => s.text.toLowerCase());
      expect(rendered).toEqual(
        (item.links ?? []).map((link) => link.label.toLowerCase()),
      );
    }
  });

  it("keeps project links unique", () => {
    const links = site.projects.map((project) => project.href);
    expect(new Set(links).size).toBe(links.length);
  });

  it("keeps project names unique, since they are React keys", () => {
    const names = site.projects.map((project) => project.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("loads published posts and rejects invalid slugs", () => {
    expect(getAllPosts()).not.toHaveLength(0);
    expect(getPostBySlug("hello-world")?.title).toBe("Hello, world");
    expect(getPostBySlug("../package")).toBeNull();
    expect(getPostBySlug("_template")).toBeNull();
    expect(getPostBySlug("Hello-World")).toBeNull();
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

describe("every post file", () => {
  const posts = getAllPosts();

  it("parses, so none is silently skipped", () => {
    // parsePostFile drops files with bad frontmatter with only a warning
    expect(posts.map((p) => `${p.slug}.md`).sort()).toEqual(postFiles.sort());
  });

  it("has a URL-safe slug and a real excerpt", () => {
    for (const post of posts) {
      expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(post.excerpt.length).toBeGreaterThan(20);
      expect(post.readingMinutes).toBeGreaterThanOrEqual(1);
    }
  });

  it("is listed newest first", () => {
    const dates = posts.map((p) => p.dateISO);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("links only to posts that exist", () => {
    const slugs = new Set(posts.map((p) => p.slug));
    for (const file of postFiles) {
      const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
      for (const [, slug] of raw.matchAll(/\]\(\/writing\/([^)#\s]+)/g)) {
        expect(slugs, `${file} links to /writing/${slug}`).toContain(slug);
      }
    }
  });

  it("links only to headings that exist", () => {
    for (const post of posts) {
      const html = getPostBySlug(post.slug)!.contentHtml;
      const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
      for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
        expect(ids, `${post.slug} links to #${id}`).toContain(id);
      }
    }
  });
});
