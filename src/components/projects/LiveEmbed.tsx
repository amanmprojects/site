"use client";

import { useState } from "react";

/** A live app in an iframe, loaded only when asked, since it pulls model weights. */
export function LiveEmbed({
  src,
  title,
  cta,
  note,
  height = 760,
}: {
  src: string;
  title: string;
  cta: string;
  note: string;
  height?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex h-56 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-line bg-surface text-center transition hover:border-s1/50"
      >
        {/* A faint board behind the button */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.07] transition group-hover:opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-conic-gradient(var(--color-ink) 0 25%, transparent 0 50%)",
            backgroundSize: "56px 56px",
          }}
        />
        <span className="relative rounded-full bg-ink px-5 py-2.5 font-medium text-paper transition group-hover:scale-105">
          {cta}
        </span>
        <span className="relative mt-3 text-sm text-mute">{note}</span>
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <iframe
        src={src}
        title={title}
        className="block w-full bg-white"
        style={{ height }}
        loading="lazy"
      />
    </div>
  );
}
