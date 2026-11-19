"use client";

import { useMemo, useState } from "react";
import { useWidth } from "./useWidth";

export type LineSeries = {
  name: string;
  /** [x, y] pairs, sorted by x */
  points: [number, number][];
  /** "line" is a 2px line, "dots" is markers only (sparse points like evals) */
  mark: "line" | "dots";
  color: "s1" | "s2";
};

type Props = {
  series: LineSeries[];
  ariaLabel: string;
  xLabel: string;
  logX?: boolean;
  height?: number;
  yDecimals?: number;
  /** A horizontal reference, e.g. a baseline score */
  refLine?: { y: number; label: string };
};

const M = { top: 14, right: 52, bottom: 34, left: 44 };

const colorVar = (color: LineSeries["color"]) => `var(--chart-${color})`;

/** Round ticks: steps of 1, 2 or 5 times a power of ten */
function niceStep(span: number, count: number) {
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}

function formatTick(value: number) {
  if (Math.abs(value) >= 10_000) return `${Math.round(value / 1000)}K`;
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function nearestIndex(points: [number, number][], x: number) {
  let lo = 0;
  let hi = points.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid][0] < x) lo = mid;
    else hi = mid;
  }
  return Math.abs(points[lo][0] - x) <= Math.abs(points[hi][0] - x) ? lo : hi;
}

export function LineChart({
  series,
  ariaLabel,
  xLabel,
  logX = false,
  height = 240,
  yDecimals = 2,
  refLine,
}: Props) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const geometry = useMemo(() => {
    const all = series.flatMap((s) => s.points);
    const xs = all.map((p) => p[0]);
    const ys = all.map((p) => p[1]).concat(refLine ? [refLine.y] : []);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const step = niceStep(Math.max(...ys) - Math.min(...ys), 4);
    const yMin = Math.floor(Math.min(...ys) / step) * step;
    const yMax = Math.ceil(Math.max(...ys) / step) * step;

    const innerW = Math.max(width - M.left - M.right, 1);
    const innerH = height - M.top - M.bottom;

    const tx = logX
      ? (x: number) =>
          ((Math.log10(x) - Math.log10(xMin)) /
            (Math.log10(xMax) - Math.log10(xMin))) *
          innerW
      : (x: number) => ((x - xMin) / (xMax - xMin)) * innerW;
    const inv = logX
      ? (px: number) =>
          10 **
          (Math.log10(xMin) +
            (px / innerW) * (Math.log10(xMax) - Math.log10(xMin)))
      : (px: number) => xMin + (px / innerW) * (xMax - xMin);
    const ty = (y: number) => innerH - ((y - yMin) / (yMax - yMin)) * innerH;

    const yTicks: number[] = [];
    for (let v = yMin; v <= yMax + step / 2; v += step) yTicks.push(+v.toFixed(6));

    const xTicks: number[] = [];
    if (logX) {
      for (let p = Math.ceil(Math.log10(xMin)); 10 ** p <= xMax; p++)
        xTicks.push(10 ** p);
    } else {
      const xs = niceStep(xMax - xMin, 4);
      for (let v = Math.ceil(xMin / xs) * xs; v <= xMax; v += xs) xTicks.push(v);
    }

    return { tx, ty, inv, innerW, innerH, yTicks, xTicks };
  }, [series, refLine, width, height, logX]);

  const { tx, ty, inv, innerW, innerH, yTicks, xTicks } = geometry;
  const lead = series[0].points;
  const activeX = active === null ? null : lead[active][0];

  const readout =
    activeX === null
      ? null
      : series.map((s) => {
          const p = s.points[nearestIndex(s.points, activeX)];
          return { series: s, point: p };
        });

  // End labels ride the last point; skip the later ones if they would collide
  const endLabels: { s: LineSeries; y: number; value: number }[] = [];
  for (const s of series) {
    const last = s.points[s.points.length - 1];
    const y = ty(last[1]);
    if (endLabels.every((l) => Math.abs(l.y - y) > 14))
      endLabels.push({ s, y, value: last[1] });
  }

  function onPointer(e: React.PointerEvent<SVGRectElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const px = Math.min(Math.max(e.clientX - box.left, 0), innerW);
    setActive(nearestIndex(lead, inv(px)));
  }

  function onKey(e: React.KeyboardEvent<SVGSVGElement>) {
    const jump = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((i) => {
        const at = i ?? lead.length - 1;
        const next = e.key === "ArrowRight" ? at + jump : at - jump;
        return Math.min(Math.max(next, 0), lead.length - 1);
      });
    }
  }

  const tooltipLeft =
    activeX === null ? 0 : M.left + tx(activeX) + (tx(activeX) > innerW - 170 ? -182 : 14);

  return (
    <div>
      {series.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-mute">
          {series.map((s) => (
            <li key={s.name} className="flex items-center gap-2">
              {s.mark === "line" ? (
                <span
                  className="h-0.5 w-4 rounded-full"
                  style={{ background: colorVar(s.color) }}
                />
              ) : (
                <span
                  className="size-2 rounded-full"
                  style={{ background: colorVar(s.color) }}
                />
              )}
              {s.name}
            </li>
          ))}
        </ul>
      )}
      <div ref={ref} className="relative" style={{ height }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={ariaLabel}
            tabIndex={0}
            onKeyDown={onKey}
            onFocus={() => setActive((i) => i ?? lead.length - 1)}
            onBlur={() => setActive(null)}
            className="overflow-visible outline-none"
          >
            <g transform={`translate(${M.left},${M.top})`}>
              {yTicks.map((t) => (
                <g key={t}>
                  <line
                    x1={0}
                    x2={innerW}
                    y1={ty(t)}
                    y2={ty(t)}
                    stroke="var(--color-line)"
                  />
                  <text
                    x={-8}
                    y={ty(t)}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-mute text-[12px] tabular-nums"
                  >
                    {formatTick(t)}
                  </text>
                </g>
              ))}
              {xTicks.map((t) => (
                <text
                  key={t}
                  x={tx(t)}
                  y={innerH + 18}
                  textAnchor="middle"
                  className="fill-mute text-[12px] tabular-nums"
                >
                  {formatTick(t)}
                </text>
              ))}
              <text
                x={innerW}
                y={innerH + 32}
                textAnchor="end"
                className="fill-mute text-[12px]"
              >
                {xLabel}
                {logX ? " (log scale)" : ""}
              </text>

              {refLine && (
                <g>
                  <line
                    x1={0}
                    x2={innerW}
                    y1={ty(refLine.y)}
                    y2={ty(refLine.y)}
                    stroke="var(--color-mute)"
                    strokeWidth={1}
                  />
                  <text
                    x={4}
                    y={ty(refLine.y) - 6}
                    className="fill-mute text-[12px]"
                  >
                    {refLine.label}
                  </text>
                </g>
              )}

              {series.map((s) =>
                s.mark === "line" ? (
                  <path
                    key={s.name}
                    d={s.points
                      .map(([x, y], i) => `${i ? "L" : "M"}${tx(x).toFixed(1)},${ty(y).toFixed(1)}`)
                      .join("")}
                    fill="none"
                    stroke={colorVar(s.color)}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ) : (
                  <g key={s.name}>
                    {s.points.map(([x, y]) => (
                      <circle
                        key={x}
                        cx={tx(x)}
                        cy={ty(y)}
                        r={4}
                        fill={colorVar(s.color)}
                        stroke="var(--color-paper)"
                        strokeWidth={2}
                      />
                    ))}
                  </g>
                ),
              )}

              {endLabels.map(({ s, y, value }) => (
                <text
                  key={s.name}
                  x={innerW + 8}
                  y={y}
                  dy="0.32em"
                  className="fill-ink text-[12px] font-semibold tabular-nums"
                >
                  {value.toFixed(yDecimals)}
                </text>
              ))}

              {readout && activeX !== null && (
                <g pointerEvents="none">
                  <line
                    x1={tx(activeX)}
                    x2={tx(activeX)}
                    y1={0}
                    y2={innerH}
                    stroke="var(--color-mute)"
                    strokeWidth={1}
                  />
                  {readout.map(({ series: s, point }) => (
                    <circle
                      key={s.name}
                      cx={tx(point[0])}
                      cy={ty(point[1])}
                      r={5}
                      fill={colorVar(s.color)}
                      stroke="var(--color-paper)"
                      strokeWidth={2}
                    />
                  ))}
                </g>
              )}

              <rect
                width={innerW}
                height={innerH}
                fill="transparent"
                onPointerMove={onPointer}
                onPointerDown={onPointer}
                onPointerLeave={() => setActive(null)}
              />
            </g>
          </svg>
        )}

        {readout && activeX !== null && (
          <div
            className="pointer-events-none absolute top-1 w-[168px] rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-sm"
            style={{ left: tooltipLeft }}
            aria-hidden
          >
            <div className="text-xs text-mute tabular-nums">
              {xLabel} {activeX.toLocaleString("en-US")}
            </div>
            {readout.map(({ series: s, point }) => (
              <div key={s.name} className="mt-1 flex items-center gap-2">
                <span
                  className="h-0.5 w-3 shrink-0 rounded-full"
                  style={{ background: colorVar(s.color) }}
                />
                <span className="font-semibold text-ink tabular-nums">
                  {point[1].toFixed(yDecimals)}
                </span>
                <span className="truncate text-xs text-mute">
                  {s.name}
                  {point[0] !== activeX && ` @ ${point[0].toLocaleString("en-US")}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
