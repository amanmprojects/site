import type { Metadata } from "next";
import Link from "next/link";
import { Content, SectionHeading } from "@/components/Content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing",
  description: `Writing by ${site.name}`,
};

export default function WritingPage() {
  return (
    <Content>
      <p className="font-medium text-mute">{site.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Writing
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-mute">
        Notes on building products, software craft, and shipping in public.
      </p>

      <section className="mt-12">
        <SectionHeading>All posts</SectionHeading>
        {site.writing.length === 0 ? (
          <p className="mt-6 text-[15px] leading-relaxed text-mute">
            Nothing here yet — check back soon.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line">
            {site.writing.map((post) => (
              <li key={post.href} className="py-5 first:pt-0">
                <Link href={post.href} className="group block">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="text-lg font-medium text-ink transition group-hover:text-blue">
                      {post.title}
                    </h2>
                    <time className="shrink-0 text-sm text-mute">
                      {post.date}
                    </time>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-mute">
                    {post.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-14 text-sm text-mute">
        <Link href="/" className="u">
          ← back home
        </Link>
      </footer>
    </Content>
  );
}
