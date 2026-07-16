import type { Metadata } from "next";
import Link from "next/link";
import { Content, SectionHeading } from "@/components/Content";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing",
  description: `Writing by ${site.name}`,
};

function groupByYear(posts: PostMeta[]) {
  const groups = new Map<number, PostMeta[]>();
  for (const post of posts) {
    const year = new Date(post.dateISO).getFullYear();
    const list = groups.get(year) ?? [];
    list.push(post);
    groups.set(year, list);
  }
  // Years already newest-first because posts are sorted that way
  return Array.from(groups.entries());
}

function formatListDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function WritingPage() {
  const posts = getAllPosts();
  const byYear = groupByYear(posts);

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
        {posts.length === 0 ? (
          <>
            <SectionHeading>All posts</SectionHeading>
            <p className="mt-6 text-[15px] leading-relaxed text-mute">
              Nothing here yet — drop a Markdown file in{" "}
              <code className="rounded bg-line px-1.5 py-0.5 text-sm text-ink">
                content/writing/
              </code>{" "}
              to publish.
            </p>
          </>
        ) : (
          <div className="space-y-12">
            {byYear.map(([year, yearPosts]) => (
              <div key={year}>
                <SectionHeading>{year}</SectionHeading>
                <ul className="mt-6 divide-y divide-line">
                  {yearPosts.map((post) => (
                    <li key={post.href} className="py-5 first:pt-0">
                      <Link href={post.href} className="group block">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h2 className="text-lg font-medium text-ink transition group-hover:text-blue">
                            {post.title}
                            {post.draft && (
                              <span className="ml-2 align-middle text-xs font-normal text-mute">
                                draft
                              </span>
                            )}
                          </h2>
                          <time
                            dateTime={post.dateISO}
                            className="shrink-0 text-sm text-mute"
                          >
                            {formatListDate(post.dateISO)}
                          </time>
                        </div>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-mute">
                          {post.excerpt}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
