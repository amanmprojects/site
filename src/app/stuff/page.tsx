import type { Metadata } from "next";
import Link from "next/link";
import { Content, SectionHeading } from "@/components/Content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stuff",
  description: `Projects and experiments by ${site.name}`,
};

export default function StuffPage() {
  return (
    <Content>
      <p className="font-medium text-mute">{site.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Stuff
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-mute">
        Things I&apos;ve built — products, tools, and experiments.
      </p>

      <section className="mt-12">
        <SectionHeading>Projects</SectionHeading>
        <ul className="mt-6 space-y-1">
          {site.projects.map((project) => (
            <li
              key={project.name}
              className="rounded-xl border border-transparent py-4 transition hover:border-line hover:bg-white/50"
            >
              <a
                href={project.href}
                target={project.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  project.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="group block px-1"
              >
                <h2 className="text-lg font-medium text-ink transition group-hover:text-blue">
                  {project.name}
                  {project.href.startsWith("http") && (
                    <span className="ml-1.5 text-sm font-normal text-mute">
                      ↗
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-[15px] leading-relaxed text-mute">
                  {project.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-14 text-sm text-mute">
        <Link href="/" className="u">
          ← back home
        </Link>
      </footer>
    </Content>
  );
}
