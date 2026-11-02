import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

const postsDirectory = path.join(process.cwd(), "content", "writing");

const WORDS_PER_MINUTE = 230;

export type PostMeta = {
  slug: string;
  title: string;
  /** Display date, e.g. "Jul 2026" */
  date: string;
  /** ISO date for sorting */
  dateISO: string;
  excerpt: string;
  href: string;
  readingMinutes: number;
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

/** URL fragment for a heading, e.g. "Act 5: `wl wet 1`" → "act-5-wl-wet-1". */
export function slugifyHeading(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links and images
    .replace(/<[^>]+>/g, "") // inline HTML
    .replace(/&[a-z]+;|&#\d+;/gi, "") // entities
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function renderMarkdown(markdown: string): string {
  // Per-document counter so repeated headings get -1, -2 suffixes
  const seen = new Map<string, number>();
  const md = new Marked({ gfm: true, breaks: false });
  md.use({
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens);
        const base = slugifyHeading(text) || "section";
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const id = count === 0 ? base : `${base}-${count}`;
        // A heading that already contains a link can't be wrapped in another
        const body = inner.includes("<a ")
          ? inner
          : `<a class="anchor" href="#${id}">${inner}</a>`;
        return `<h${depth} id="${id}">${body}</h${depth}>\n`;
      },
      tablecell({ tokens, header, align, text }) {
        // An empty header cell tops a row-label column; it labels nothing
        const tag = header && text.trim() ? "th" : "td";
        // A style, not the align attribute, so it beats .prose's text-align
        const style = align ? ` style="text-align:${align}"` : "";
        return `<${tag}${style}>${this.parser.parseInline(tokens)}</${tag}>\n`;
      },
    },
  });

  const renderedHtml = md.parse(markdown.trim(), { async: false }) as string;
  const textAlign = { "text-align": [/^(?:left|right|center)$/] };

  return sanitizeHtml(renderedHtml, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      ...Object.fromEntries(
        ["h1", "h2", "h3", "h4", "h5", "h6"].map((tag) => [tag, ["id"]]),
      ),
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["style"],
      td: ["style"],
    },
    allowedClasses: { a: ["anchor"] },
    allowedStyles: { th: textAlign, td: textAlign },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

/** Markdown reduced to the words a reader sees, without code blocks. */
function toPlainText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
    .replace(/<[^>]+>/g, " ") // inline HTML
    .replace(/[*_~>\[\]|]/g, "") // markdown punctuation
    .replace(/\s+/g, " ")
    .trim();
}

export function makeFallbackExcerpt(content: string): string {
  const plain = toPlainText(content);
  if (plain.length <= 160) return plain;
  const cut = plain.slice(0, 160);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function readingMinutes(content: string): number {
  const words = toPlainText(content).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

type ParsedPost = { meta: PostMeta; content: string };

function parsePostFile(filename: string): ParsedPost | null {
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

  return {
    meta: {
      slug,
      title: fm.title,
      date: formatDisplayDate(dateISO),
      dateISO,
      excerpt: fm.excerpt || makeFallbackExcerpt(content),
      href: `/writing/${slug}`,
      readingMinutes: readingMinutes(content),
      draft: Boolean(fm.draft),
    },
    content,
  };
}

/** All published posts, newest first. */
export function getAllPosts(): PostMeta[] {
  return ensurePostsDir()
    .map(parsePostFile)
    .filter((p): p is ParsedPost => p !== null)
    .map((p) => p.meta)
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO) || a.slug.localeCompare(b.slug));
}

/** Full post by slug, or null if missing. */
export function getPostBySlug(slug: string): Post | null {
  if (!slugPattern.test(slug)) return null;

  const filename = `${slug}.md`;
  const fullPath = path.join(postsDirectory, filename);
  if (!fs.existsSync(fullPath)) return null;
  const parsed = parsePostFile(filename);
  if (!parsed) return null;
  return { ...parsed.meta, contentHtml: renderMarkdown(parsed.content) };
}

/** Slugs for generateStaticParams. */
export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

/** The posts published just after and just before `slug`. */
export function getAdjacentPosts(slug: string): {
  newer: PostMeta | null;
  older: PostMeta | null;
} {
  const posts = getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { newer: null, older: null };
  return { newer: posts[i - 1] ?? null, older: posts[i + 1] ?? null };
}

/** Posts grouped by publication year, keeping the input order. */
export function groupPostsByYear(posts: PostMeta[]): [string, PostMeta[]][] {
  const groups = new Map<string, PostMeta[]>();
  for (const post of posts) {
    // Read the year from the ISO string: Date#getFullYear uses the local
    // time zone and files Jan 1 posts under the previous year west of UTC.
    const year = post.dateISO.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return Array.from(groups.entries());
}
