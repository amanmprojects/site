"use client";

import { useState } from "react";

export type Bar = {
  label: string;
  value: number;
  /** Shown at the bar's tip instead of the raw value */
  display?: string;
  /** The bar the story is about wears the accent; the rest stay neutral */
  accent?: boolean;
};

/** Horizontal bars from a shared zero baseline, value at the tip. */
export function BarList({
  bars,
  ariaLabel,
  max,
}: {
  bars: Bar[];
  ariaLabel: string;
  max?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const top = max ?? Math.max(...bars.map((b) => b.value));

  return (
    <ul aria-label={ariaLabel} className="space-y-3">
      {bars.map((bar, i) => (
        <li
          key={bar.label}
          tabIndex={0}
          onPointerEnter={() => setHovered(i)}
          onPointerLeave={() => setHovered(null)}
          onFocus={() => setHovered(i)}
          onBlur={() => setHovered(null)}
          className="group rounded-md outline-offset-4"
        >
          <div className="text-sm text-mute group-hover:text-ink group-focus:text-ink">
            {bar.label}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div
              className="h-4 rounded-r-[4px] transition-[filter,opacity]"
              style={{
                width: `max(${(bar.value / top) * 85}%, 4px)`,
                background: bar.accent
                  ? "var(--chart-s1)"
                  : "color-mix(in srgb, var(--color-mute) 45%, transparent)",
                filter: hovered === i ? "brightness(1.15)" : undefined,
                opacity: hovered !== null && hovered !== i ? 0.55 : 1,
              }}
            />
            <span
              className={`text-sm tabular-nums ${
                bar.accent ? "font-semibold text-ink" : "text-mute"
              }`}
            >
              {bar.display ?? bar.value.toLocaleString("en-US")}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
