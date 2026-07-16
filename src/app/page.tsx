import Link from "next/link";
import { Content, SectionHeading } from "@/components/Content";
import { SocialLinks } from "@/components/SocialLinks";
import { site, type StoryItem } from "@/lib/site";

function StoryLine({ item }: { item: StoryItem }) {
  if (!item.links?.length) {
    return <>{item.text}</>;
  }

  // Wrap known link labels in the story text with dotted links
  const parts: React.ReactNode[] = [];
  let remaining = item.text;
  let key = 0;

  for (const link of item.links) {
    const idx = remaining.toLowerCase().indexOf(link.label.toLowerCase());
    if (idx === -1) continue;
    if (idx > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    }
    const matched = remaining.slice(idx, idx + link.label.length);
    parts.push(
      <a
        key={key++}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="lnk"
      >
        {matched}
      </a>,
    );
    remaining = remaining.slice(idx + link.label.length);
  }
  if (remaining) parts.push(<span key={key++}>{remaining}</span>);

  return <>{parts.length ? parts : item.text}</>;
}

export default function Home() {
  const previewWriting = site.writing.slice(0, 5);
  const previewProjects = site.projects.slice(0, 4);

  return (
    <Content>
      {/* Intro */}
      <p className="font-medium text-mute">{site.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        {site.headline.before}{" "}
        <span className="grad">{site.headline.highlight1}</span>
        <br />
        {site.headline.middle}{" "}
        <span className="grad">{site.headline.highlight2}</span>
        {site.headline.after}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink">
        {site.bio.role} — focused on{" "}
        <a
          href={site.socials.github}
          target="_blank"
          rel="noopener noreferrer"
          className="lnk"
        >
          {site.bio.focus}
        </a>
        . {site.bio.extra}
      </p>

      <SocialLinks />

      {/* Story */}
      <section className="mt-12">
        <ul className="list-disc space-y-2.5 pl-5 leading-relaxed text-ink marker:text-mute">
          {site.story.map((item, i) => (
            <li key={i}>
              <StoryLine item={item} />
            </li>
          ))}
        </ul>
      </section>

      {/* Writing — only when posts exist */}
      {previewWriting.length > 0 && (
        <section className="mt-14">
          <SectionHeading>Writing</SectionHeading>
          <ul className="mt-4 space-y-1">
            {previewWriting.map((post) => (
              <li key={post.href} className="py-1.5">
                <Link
                  href={post.href}
                  className="u group inline-flex flex-wrap items-baseline gap-x-2"
                >
                  <span className="font-medium text-ink group-hover:text-blue">
                    {post.title}
                  </span>
                  <span className="text-sm text-mute">{post.date}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/writing"
            className="u mt-3 inline-block text-sm text-mute"
          >
            all writing →
          </Link>
        </section>
      )}

      {/* Stuff */}
      <section className="mt-14">
        <SectionHeading>Stuff</SectionHeading>
        <ul className="mt-4">
          {previewProjects.map((project) => (
            <li key={project.name} className="py-2">
              <a
                href={project.href}
                target={project.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  project.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="u font-medium"
              >
                {project.name}
              </a>
              <span className="text-mute"> — {project.description}</span>
            </li>
          ))}
        </ul>
        <Link href="/stuff" className="u mt-2 inline-block text-sm text-mute">
          all stuff →
        </Link>
      </section>

      {/* GitHub contributions */}
      <section className="mt-14">
        <div className="overflow-x-auto rounded-xl border border-line p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://ghchart.rshah.org/2f6bff/${site.githubUsername}`}
            alt={`${site.name}'s GitHub contribution graph`}
            loading="lazy"
            className="h-auto w-full min-w-[620px]"
          />
        </div>
        <p className="mt-2 text-sm text-mute">{site.footerNote}</p>
      </section>

      <footer className="mt-16 flex flex-wrap gap-x-5 gap-y-2 text-sm text-mute">
        <Link href="/guestbook" className="u">
          Sign my guestbook
        </Link>
        <a
          href={site.socials.github}
          target="_blank"
          rel="noopener noreferrer"
          className="u"
        >
          GitHub →
        </a>
      </footer>
    </Content>
  );
}
