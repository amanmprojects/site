/** One whole split into parts, e.g. wins / draws / losses. */
export type Segment = { label: string; value: number; color: string };

export function SegmentedBar({
  segments,
  ariaLabel,
}: {
  segments: Segment[];
  ariaLabel: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div>
      <div
        role="img"
        aria-label={ariaLabel}
        className="flex h-6 w-full gap-[2px] overflow-hidden rounded-[4px]"
      >
        {segments.map((s) => (
          <div
            key={s.label}
            title={`${s.label}: ${s.value}`}
            style={{ flexGrow: s.value, background: s.color }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-[2px]" style={{ background: s.color }} />
            <span className="font-semibold text-ink tabular-nums">{s.value}</span>
            <span className="text-mute">
              {s.label} ({Math.round((s.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
