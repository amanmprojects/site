import type { Metadata } from "next";
import Link from "next/link";
import { Content, SectionHeading } from "@/components/Content";
import { Sparkline } from "@/components/charts/Sparkline";
import { cardSparklines } from "@/components/projects/showcases";
import {
  formatStarted,
  projectGroups,
  projectHref,
  projects,
  type Project,
} from "@/lib/projects";
import { site } from "@/lib/site";

const description = `Projects and experiments by ${site.name}`;

export const metadata: Metadata = {
  title: "Stuff",
  description,
  alternates: { canonical: "/stuff" },
  openGraph: {
    title: `Stuff · ${site.name}`,
    description,
    url: "/stuff",
    images: [{ url: "/opengraph-image", alt: `${site.name} portfolio` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Stuff · ${site.name}`,
    description,
    images: ["/opengraph-image"],
  },
};

function FeaturedCard({ project }: { project: Project }) {
  const stat = project.stats?.[0];
  const spark = cardSparklines[project.slug];
  const shot = project.screenshots?.[0];
  return (
    <Link
      href={projectHref(project)}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface/40 transition hover:-translate-y-0.5 hover:border-s1/50 hover:bg-surface"
    >
      {shot && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shot.src}
          alt=""
          width={shot.width}
          height={shot.height}
          loading="lazy"
          className="aspect-[16/9] w-full border-b border-line object-cover object-top"
        />
      )}
      <span className="flex grow flex-col p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-mute">
          {project.group}
        </span>
        <span className="mt-2 text-lg font-semibold text-ink transition group-hover:text-blue">
          {project.name}
        </span>
        <span className="mt-1 text-[15px] leading-snug text-mute">
          {project.tagline}
        </span>
        {(stat || spark) && (
          <span className="mt-auto flex items-end justify-between gap-3 pt-6">
            {stat && (
              <span className="min-w-0">
                <span className="block text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {stat.value}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-mute">
                  {stat.label}
                </span>
              </span>
            )}
            {spark && (
              <span className="shrink-0">
                <Sparkline
                  points={spark.points}
                  logX={spark.logX}
                  width={96}
                  height={32}
                />
              </span>
            )}
          </span>
        )}
      </span>
    </Link>
  );
}

export default function StuffPage() {
  // Cards with a screenshot first, so each row has matching cards
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => Number(!a.screenshots) - Number(!b.screenshots));
  const rest = projectGroups
    .map((group) => ({
      group,
      items: projects.filter((p) => !p.featured && p.group === group),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <Content wide>
      <p className="font-medium text-mute">{site.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Stuff
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-mute">
        Models I trained from scratch, games and engines, Linux tools, agent
        tooling, and a few web apps. Every project has a page with how it works
        and its architecture.
      </p>

      <section className="mt-12" aria-label="Featured projects">
        <ul className="grid gap-3 sm:grid-cols-2">
          {featured.map((project) => (
            <li key={project.slug} className="flex">
              <FeaturedCard project={project} />
            </li>
          ))}
        </ul>
      </section>


      {rest.map(({ group, items }) => (
        <section key={group} className="mt-14">
          <SectionHeading>{group}</SectionHeading>
          <ul className="mt-3 divide-y divide-line">
            {items.map((project) => (
              <li key={project.slug}>
                <Link
                  href={projectHref(project)}
                  className="group flex items-baseline justify-between gap-4 py-3"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-ink transition group-hover:text-blue">
                      {project.name}
                    </span>
                    <span className="text-mute"> — {project.tagline}</span>
                  </span>
                  <span className="shrink-0 text-sm text-mute tabular-nums">
                    {formatStarted(project.started)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="mt-14 text-sm text-mute">
        <Link href="/" className="u">
          ← back home
        </Link>
      </footer>
    </Content>
  );
}
