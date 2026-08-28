import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

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

const frontmatterSchema = z.object({
  title: z.string().trim().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must use YYYY-MM-DD")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
    }, {
      message: "must be a valid date",
    }),
  excerpt: z.string().trim().optional(),
  draft: z.boolean().optional().default(false),
});

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function formatDisplayDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function ensurePostsDir() {
  if (!fs.existsSync(postsDirectory)) {
    return [] as string[];
  }
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"));
}

export function renderMarkdown(markdown: string): string {
  const renderedHtml = marked.parse(markdown.trim(), {
    async: false,
    gfm: true,
    breaks: false,
  }) as string;

  return sanitizeHtml(renderedHtml, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

function parsePostFile(filename: string): Post | null {
  const slug = filename.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, filename);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const result = frontmatterSchema.safeParse(data);

  if (!result.success) {
    console.warn(
      `[posts] Skipping ${filename}: ${z.prettifyError(result.error)}`,
    );
    return null;
  }

  const fm = result.data;

  // Hide drafts in production; show them in dev so you can preview
  if (fm.draft && process.env.NODE_ENV === "production") {
    return null;
  }

  const dateISO = fm.date;
  const contentHtml = renderMarkdown(content);

  return {
    slug,
    title: fm.title,
    date: formatDisplayDate(dateISO),
    dateISO,
    excerpt:
      fm.excerpt || content.trim().slice(0, 160).replace(/\s+/g, " "),
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

  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    dateISO: post.dateISO,
    excerpt: post.excerpt,
    href: post.href,
    draft: post.draft,
  }));
}

/** Full post by slug, or null if missing. */
export function getPostBySlug(slug: string): Post | null {
  if (!slugPattern.test(slug)) return null;

  const filename = `${slug}.md`;
  const fullPath = path.join(postsDirectory, filename);
  if (!fs.existsSync(fullPath)) return null;
  return parsePostFile(filename);
}

/** Slugs for generateStaticParams. */
export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
