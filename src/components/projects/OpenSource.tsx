import { formatStars, ossProjects, prUrl, repoUrl } from "@/lib/oss";

/** "2026-10-22" → "Oct 22" */
function formatMerged(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Merged pull requests in other people's projects, biggest project first. */
export function OpenSource() {
  const projects = [...ossProjects].sort((a, b) => b.stars - a.stars);

  return (
    <ul className="divide-y divide-line rounded-2xl border border-line">
      {projects.map((project) => (
        <li key={project.repo} className="px-5 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <a
              href={repoUrl(project.repo)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-baseline gap-2"
            >
              <span className="font-semibold text-ink transition group-hover:text-blue">
                {project.name}
              </span>
              <span className="text-sm text-mute">{project.repo}</span>
            </a>
            <span className="text-sm text-mute tabular-nums">
              <span aria-hidden>★ </span>
              <span className="sr-only">GitHub stars: </span>
              {formatStars(project.stars)}
            </span>
          </div>
          <p className="mt-1 text-sm leading-snug text-mute">
            {project.description}
          </p>
          <ul className="mt-3 space-y-1.5">
            {project.prs.map((pr) => (
              <li
                key={pr.number}
                className="flex gap-3 text-[15px] leading-snug"
              >
                <span
                  aria-hidden
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-s1"
                />
                <a
                  href={prUrl(project.repo, pr.number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group min-w-0"
                >
                  <span className="text-ink transition group-hover:text-blue">
                    {pr.title}
                  </span>
                  <span className="ml-2 whitespace-nowrap text-sm text-mute tabular-nums">
                    #{pr.number} · merged {formatMerged(pr.merged)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
