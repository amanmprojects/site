import type { Metadata } from "next";
import Link from "next/link";
import { Content, SectionHeading } from "@/components/Content";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  const recent = getAllPosts().slice(0, 3);

  return (
    <Content>
      <p className="font-medium text-mute">404</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-mute">
        Nothing lives at this address. It may have moved, or the link has a
        typo.
      </p>

      <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <li>
          <Link href="/" className="u">
            ← home
          </Link>
        </li>
        <li>
          <Link href="/writing" className="u">
            all writing
          </Link>
        </li>
        <li>
          <Link href="/stuff" className="u">
            all stuff
          </Link>
        </li>
      </ul>

      {recent.length > 0 && (
        <section className="mt-14">
          <SectionHeading>Recent writing</SectionHeading>
          <ul className="mt-4 space-y-1">
            {recent.map((post) => (
              <li key={post.href} className="py-1.5">
                <Link href={post.href} className="u font-medium">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Content>
  );
}
