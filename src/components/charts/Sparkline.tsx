/** A static trend line for cards: no axes, the shape is the point. */
export function Sparkline({
  points,
  logX = false,
  width = 120,
  height = 36,
}: {
  points: [number, number][];
  logX?: boolean;
  width?: number;
  height?: number;
}) {
  const fx = (x: number) => (logX ? Math.log10(x) : x);
  const xs = points.map((p) => fx(p[0]));
  const ys = points.map((p) => p[1]);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const pad = 3;
  const sx = (x: number) => pad + ((fx(x) - x0) / (x1 - x0)) * (width - 2 * pad);
  const sy = (y: number) => pad + (1 - (y - y0) / (y1 - y0)) * (height - 2 * pad);
  const d = points
    .map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    .join("");
  const [lx, ly] = points[points.length - 1];

  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke="var(--color-mute)"
        strokeOpacity={0.6}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={sx(lx)} cy={sy(ly)} r={3} fill="var(--chart-s1)" />
    </svg>
  );
}
