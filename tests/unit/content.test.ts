import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/posts";
import { formatStars, ossProjects } from "@/lib/oss";
import { getProject, projectGroups, projects } from "@/lib/projects";
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

  it("keeps project slugs, names and repos unique", () => {
    for (const key of ["slug", "name", "repo"] as const) {
      const values = projects.map((project) => project[key]).filter(Boolean);
      expect(new Set(values).size, key).toBe(values.length);
    }
  });

  it("gives every project a URL-safe slug, a known group and a start month", () => {
    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(projectGroups).toContain(project.group);
      expect(project.started).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(getProject(project.slug)).toBe(project);
    }
  });

  it("gives every project an explanation, an architecture and real screenshots", () => {
    for (const project of projects) {
      expect(project.howItWorks.length, project.slug).toBeGreaterThan(0);
      expect(project.architecture.stages.length, project.slug).toBeGreaterThanOrEqual(3);
      for (const shot of project.screenshots ?? []) {
        expect(shot.src, project.slug).toMatch(/^\/images\/stuff\//);
        expect(fs.existsSync(path.join(process.cwd(), "public", shot.src)), shot.src).toBe(true);
        expect(shot.alt.length, shot.src).toBeGreaterThan(10);
      }
    }
  });

  it("links projects only to posts that exist", () => {
    for (const project of projects) {
      for (const slug of project.posts ?? []) {
        expect(getPostBySlug(slug), `${project.slug} → ${slug}`).not.toBeNull();
      }
    }
  });

  it("lists each open source repo and pull request once", () => {
    const repos = ossProjects.map((p) => p.repo);
    expect(new Set(repos).size).toBe(repos.length);
    for (const project of ossProjects) {
      expect(project.repo).toMatch(/^[\w.-]+\/[\w.-]+$/);
      const numbers = project.prs.map((pr) => pr.number);
      expect(new Set(numbers).size, project.repo).toBe(numbers.length);
      for (const pr of project.prs) expect(pr.merged).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("formats star counts compactly", () => {
    expect(formatStars(34)).toBe("34");
    expect(formatStars(981)).toBe("981");
    expect(formatStars(21216)).toBe("21.2K");
    expect(formatStars(3000)).toBe("3K");
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
