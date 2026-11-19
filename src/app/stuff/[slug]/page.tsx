import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Content, SectionHeading } from "@/components/Content";
import { Figure } from "@/components/charts/Figure";
import { Pipeline } from "@/components/charts/Pipeline";
import { Screenshots } from "@/components/projects/Screenshots";
import { showcases } from "@/components/projects/showcases";
import { getPostBySlug } from "@/lib/posts";
import {
  formatStarted,
  getProject,
  projectHref,
  projects,
} from "@/lib/projects";
import { site } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

// Every project is known at build time; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };
  const href = projectHref(project);
  return {
    title: project.name,
    description: project.description,
    alternates: { canonical: href },
    openGraph: {
      title: `${project.name} · ${site.name}`,
      description: project.description,
      url: href,
      images: [{ url: "/opengraph-image", alt: `${site.name} portfolio` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} · ${site.name}`,
      description: project.description,
      images: ["/opengraph-image"],
    },
  };
}

function ExternalButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-s1/50 hover:text-blue"
    >
      {children}
      <span aria-hidden className="text-mute">
        ↗
      </span>
    </a>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const Showcase = showcases[project.slug];
  const posts = (project.posts ?? [])
    .map((postSlug) => getPostBySlug(postSlug))
    .filter((post) => post !== null);

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  return (
    <Content wide>
      <header>
        <p className="font-medium text-mute">
          <Link href="/stuff" className="u">
            Stuff
          </Link>
          <span className="mx-2 text-line" aria-hidden>
            /
          </span>
          <span>{project.group}</span>
          <span className="mx-2 text-line" aria-hidden>
            ·
          </span>
          <span>since {formatStarted(project.started)}</span>
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {project.name}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink">
          {project.description}
        </p>
        {project.credit && (
          <p className="mt-4 rounded-xl border border-line bg-surface/60 px-4 py-3 text-[15px] leading-relaxed text-mute">
            {project.credit}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          {project.live && <ExternalButton href={project.live}>Open it</ExternalButton>}
          {project.repo && <ExternalButton href={project.repo}>Source on GitHub</ExternalButton>}
          {project.links?.map((link) => (
            <ExternalButton key={link.href} href={link.href}>
              {link.label}
            </ExternalButton>
          ))}
        </div>
      </header>

      {project.stats && project.stats.length > 0 && (
        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-line py-6">
          {project.stats.map((stat) => (
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
      )}

      {project.screenshots && <Screenshots shots={project.screenshots} />}

      <section className="mt-14">
        <SectionHeading>How it works</SectionHeading>
        <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-ink">
          {project.howItWorks.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <Figure title="Architecture" caption={project.architecture.caption}>
        <Pipeline
          stages={project.architecture.stages}
          ariaLabel={`${project.name} architecture`}
        />
      </Figure>

      {Showcase && <Showcase />}

      <section className="mt-14">
        <SectionHeading>Built with</SectionHeading>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <li
              key={item}
              className="rounded-full bg-line/60 px-3 py-1 text-sm text-ink"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {posts.length > 0 && (
        <section className="mt-14">
          <SectionHeading>Writing about it</SectionHeading>
          <ul className="mt-4 space-y-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={post.href} className="group block">
                  <span className="font-medium text-ink transition group-hover:text-blue">
                    {post.title}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-mute">
                    {post.excerpt}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 text-sm text-mute">
        <Link href="/stuff" className="u">
          ← all stuff
        </Link>
        <Link href={projectHref(next)} className="u">
          Next: {next.name} →
        </Link>
      </footer>
    </Content>
  );
}
