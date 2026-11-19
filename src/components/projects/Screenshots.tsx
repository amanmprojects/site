import type { Screenshot } from "@/lib/projects";

/** Product screenshots; each opens full size in a new tab. */
export function Screenshots({ shots }: { shots: Screenshot[] }) {
  return (
    <div className="mt-12 space-y-8">
      {shots.map((shot) => (
        <figure key={shot.src}>
          <a
            href={shot.src}
            target="_blank"
            rel="noopener"
            className="block overflow-hidden rounded-xl border border-line transition hover:border-s1/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              loading="lazy"
              className="block h-auto w-full"
            />
          </a>
          {shot.caption && (
            <figcaption className="mt-2.5 text-sm leading-relaxed text-mute">
              {shot.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
