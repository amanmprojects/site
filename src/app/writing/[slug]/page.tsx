import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Content } from "@/components/Content";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { site } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <Content>
      <p className="font-medium text-mute">
        <Link href="/writing" className="u">
          Writing
        </Link>
        <span className="mx-2 text-line">/</span>
        <time dateTime={post.dateISO}>{post.date}</time>
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
        <p className="mt-4 text-lg leading-relaxed text-mute">{post.excerpt}</p>
      )}

      <article
        className="prose mt-10"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <footer className="mt-14 text-sm text-mute">
        <p className="mb-4">— {site.name}</p>
        <Link href="/writing" className="u">
          ← all writing
        </Link>
      </footer>
    </Content>
  );
}
