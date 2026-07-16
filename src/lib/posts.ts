import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const postsDirectory = path.join(process.cwd(), "content", "writing");

export type PostMeta = {
  slug: string;
  title: string;
  /** Display date, e.g. "Jul 2026" */
  date: string;
  /** ISO date for sorting */
  dateISO: string;
  excerpt: string;
  href: string;
  draft?: boolean;
};

export type Post = PostMeta & {
  contentHtml: string;
};

type Frontmatter = {
  title?: string;
  date?: string;
  excerpt?: string;
  draft?: boolean;
};

function formatDisplayDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function ensurePostsDir() {
  if (!fs.existsSync(postsDirectory)) {
    return [] as string[];
  }
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"));
}

function parsePostFile(filename: string): Post | null {
  const slug = filename.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, filename);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;

  if (!fm.title || !fm.date) {
    console.warn(
      `[posts] Skipping ${filename}: frontmatter needs title and date`,
    );
    return null;
  }

  // Hide drafts in production; show them in dev so you can preview
  if (fm.draft && process.env.NODE_ENV === "production") {
    return null;
  }

  const dateISO = fm.date;
  const contentHtml = marked.parse(content.trim(), {
    async: false,
    gfm: true,
    breaks: false,
  }) as string;

  return {
    slug,
    title: fm.title,
    date: formatDisplayDate(dateISO),
    dateISO,
    excerpt: fm.excerpt?.trim() || content.trim().slice(0, 160).replace(/\n/g, " "),
    href: `/writing/${slug}`,
    draft: Boolean(fm.draft),
    contentHtml,
  };
}

/** All published posts, newest first. */
export function getAllPosts(): PostMeta[] {
  const files = ensurePostsDir();
  const posts = files
    .map(parsePostFile)
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));

  return posts.map(({ contentHtml: _, ...meta }) => meta);
}

/** Full post by slug, or null if missing. */
export function getPostBySlug(slug: string): Post | null {
  const filename = `${slug}.md`;
  const fullPath = path.join(postsDirectory, filename);
  if (!fs.existsSync(fullPath)) return null;
  return parsePostFile(filename);
}

/** Slugs for generateStaticParams. */
export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
