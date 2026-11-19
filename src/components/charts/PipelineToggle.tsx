"use client";

import { useId, useState } from "react";
import { Pipeline, type FlowStage } from "./Pipeline";

/** Two or more versions of a flow, switched with tabs. */
export function PipelineToggle({
  variants,
  initial = 0,
}: {
  variants: { label: string; note: string; stages: FlowStage[] }[];
  initial?: number;
}) {
  const [current, setCurrent] = useState(initial);
  const id = useId();
  const variant = variants[current];

  return (
    <div>
      <div role="tablist" className="inline-flex rounded-full border border-line p-1 text-sm">
        {variants.map((v, i) => (
          <button
            key={v.label}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === current}
            aria-controls={`${id}-panel`}
            onClick={() => setCurrent(i)}
            className={`rounded-full px-3.5 py-1.5 transition ${
              i === current ? "bg-ink font-medium text-paper" : "text-mute hover:text-ink"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${current}`}
        className="mt-5"
      >
        <p className="mb-5 text-[15px] leading-relaxed text-mute">{variant.note}</p>
        <Pipeline key={current} stages={variant.stages} ariaLabel={variant.label} />
      </div>
    </div>
  );
}
