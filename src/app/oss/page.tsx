import type { Metadata } from "next";
import Link from "next/link";
import { Content } from "@/components/Content";
import { OpenSource } from "@/components/projects/OpenSource";
import { formatStars, ossProjects } from "@/lib/oss";
import { site } from "@/lib/site";

const description = `Pull requests ${site.name} has landed in other people's open source projects`;

export const metadata: Metadata = {
  title: "Open source",
  description,
  alternates: { canonical: "/oss" },
  openGraph: {
    title: `Open source · ${site.name}`,
    description,
    url: "/oss",
    images: [{ url: "/opengraph-image", alt: `${site.name} portfolio` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Open source · ${site.name}`,
    description,
    images: ["/opengraph-image"],
  },
};

export default function OssPage() {
  const merged = ossProjects.reduce((sum, p) => sum + p.prs.length, 0);
  const biggest = Math.max(...ossProjects.map((p) => p.stars));

  return (
    <Content wide>
      <p className="font-medium text-mute">{site.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Open source
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-mute">
        Fixes and features I&apos;ve landed in other people&apos;s projects.
      </p>

      <dl className="mt-10 grid grid-cols-3 gap-6 border-y border-line py-6">
        {[
          { value: String(merged), label: "merged pull requests" },
          { value: String(ossProjects.length), label: "projects" },
          { value: formatStars(biggest), label: "stars on the biggest" },
        ].map((stat) => (
          <div key={stat.label}>
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="block text-3xl font-bold tracking-tight text-ink tabular-nums">
                {stat.value}
              </span>
              <span className="mt-1 block text-sm leading-snug text-mute">
                {stat.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10">
        <OpenSource />
      </div>

      <footer className="mt-14 text-sm text-mute">
        <Link href="/" className="u">
          ← back home
        </Link>
      </footer>
    </Content>
  );
}
