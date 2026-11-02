import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Content } from "@/components/Content";
import {
  getAdjacentPosts,
  getAllPostSlugs,
  getPostBySlug,
  type PostMeta,
} from "@/lib/posts";
import { site } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

// Every post is known at build time; anything else is a 404 without a render.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  // og:image and twitter:image come from ./opengraph-image.tsx
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: post.href },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: post.href,
      publishedTime: `${post.dateISO}T00:00:00Z`,
      authors: [site.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function AdjacentLink({
  post,
  label,
  align,
}: {
  post: PostMeta;
  label: string;
  align: "start" | "end";
}) {
  return (
    <Link
      href={post.href}
      className={`group block rounded-xl border border-line px-4 py-3 transition hover:border-blue/40 ${
        align === "end" ? "sm:col-start-2 sm:text-right" : ""
      }`}
    >
      <span className="block text-xs font-semibold uppercase tracking-wider text-mute">
        {label}
      </span>
      <span className="mt-1 block font-medium text-ink transition group-hover:text-blue">
        {post.title}
      </span>
    </Link>
  );
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const { newer, older } = getAdjacentPosts(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.dateISO,
    url: `${site.url}${post.href}`,
    image: `${site.url}${post.href}/opengraph-image`,
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <Content>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article>
        <header>
          <p className="font-medium text-mute">
            <Link href="/writing" className="u">
              Writing
            </Link>
            <span className="mx-2 text-line" aria-hidden>
              /
            </span>
            <time dateTime={post.dateISO}>{post.date}</time>
            <span className="mx-2 text-line" aria-hidden>
              ·
            </span>
            <span>{post.readingMinutes} min read</span>
            {post.draft && (
              <span className="ml-2 rounded-full bg-line px-2 py-0.5 text-xs font-medium text-mute">
                draft
              </span>
            )}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-mute">
              {post.excerpt}
            </p>
          )}
        </header>

        <div
          className="prose mt-10"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>

      <footer className="mt-14 text-sm text-mute">
        <p className="mb-6">— {site.name}</p>
        {(newer || older) && (
          <nav aria-label="More writing" className="mb-8 grid gap-3 sm:grid-cols-2">
            {older && <AdjacentLink post={older} label="← Older" align="start" />}
            {newer && <AdjacentLink post={newer} label="Newer →" align="end" />}
          </nav>
        )}
        <Link href="/writing" className="u">
          ← all writing
        </Link>
      </footer>
    </Content>
  );
}
