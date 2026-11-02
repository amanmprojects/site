import Link from "next/link";
import { Content, SectionHeading } from "@/components/Content";
import { SocialLinks } from "@/components/SocialLinks";
import { getAllPosts } from "@/lib/posts";
import { site, type StoryItem } from "@/lib/site";
import { splitStory } from "@/lib/story";

function StoryLine({ item }: { item: StoryItem }) {
  return (
    <>
      {splitStory(item).map((segment, i) =>
        segment.kind === "link" ? (
          <a
            key={i}
            href={segment.href}
            target="_blank"
            rel="noopener noreferrer"
            className="lnk"
          >
            {segment.text}
          </a>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  description: site.description,
  sameAs: Object.values(site.socials),
};

export default function Home() {
  const previewWriting = getAllPosts().slice(0, 5);
  const previewProjects = site.projects.slice(0, 4);

  return (
    <Content>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Intro */}
      <p className="font-medium text-mute">{site.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        {site.headline.before}{" "}
        <span className="grad">{site.headline.highlight1}</span>{" "}
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

      {/* GitHub contributions. Too wide for phones, so it scrolls there,
          starting from the right edge (the latest weeks). */}
      <section className="mt-14">
        <div className="overflow-x-auto rounded-xl border border-line p-4 [direction:rtl]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://ghchart.rshah.org/2f6bff/${site.githubUsername}`}
            alt={`${site.name}'s GitHub contribution graph`}
            width={663}
            height={104}
            loading="lazy"
            className="h-auto w-full min-w-[620px] [direction:ltr] sm:min-w-0 dark:hue-rotate-180 dark:invert dark:contrast-[.82]"
          />
        </div>
        <p className="mt-2 text-sm text-mute">{site.footerNote}</p>
      </section>

      <footer className="mt-16 flex flex-wrap gap-x-5 gap-y-2 text-sm text-mute">
        <a
          href={site.socials.github}
          target="_blank"
          rel="noopener noreferrer"
          className="u"
        >
          GitHub →
        </a>
        <a href="/resume" target="_blank" rel="noopener" className="u">
          Resume →
        </a>
      </footer>
    </Content>
  );
}
