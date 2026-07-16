import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Content } from "@/components/Content";
import { site } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

function getPost(slug: string) {
  return site.writing.find((p) => p.href === `/writing/${slug}`);
}

export async function generateStaticParams() {
  return site.writing.map((post) => ({
    slug: post.href.replace(/^\/writing\//, ""),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <Content>
      <p className="font-medium text-mute">
        <Link href="/writing" className="u">
          Writing
        </Link>
        <span className="mx-2 text-line">/</span>
        <time>{post.date}</time>
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-mute">{post.excerpt}</p>

      <article className="mt-10 space-y-4 leading-relaxed text-ink">
        <p className="text-mute">Post body coming soon.</p>
        <p className="text-mute">— {site.name}</p>
      </article>

      <footer className="mt-14 text-sm text-mute">
        <Link href="/writing" className="u">
          ← all writing
        </Link>
      </footer>
    </Content>
  );
}
