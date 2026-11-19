/**
 * A top-to-bottom flow: stages of one or more boxes, joined by connectors
 * with a pulse travelling down them. Side-by-side boxes in a stage are
 * alternatives or parallel inputs.
 */
export type FlowNode = { title: string; detail?: string; accent?: boolean };
export type FlowStage = {
  nodes: FlowNode[];
  /** Label on the connector leading into this stage */
  edge?: string;
};

const cols: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
};

export function Pipeline({
  stages,
  ariaLabel,
}: {
  stages: FlowStage[];
  ariaLabel: string;
}) {
  return (
    <ol aria-label={ariaLabel}>
      {stages.map((stage, i) => (
        <li key={i}>
          {i > 0 && (
            <div className="relative flex h-11 justify-center" aria-hidden={!stage.edge}>
              <span className="h-full w-px bg-line" />
              <span
                className="flow-pulse absolute left-1/2 top-0 -ml-[3px] size-1.5 rounded-full bg-s1"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
              {stage.edge && (
                <span className="absolute left-1/2 top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap text-xs text-mute">
                  {stage.edge}
                </span>
              )}
            </div>
          )}
          <div className={`grid gap-2 ${cols[stage.nodes.length] ?? "grid-cols-2"}`}>
            {stage.nodes.map((node) => (
              <div
                key={node.title}
                className={`rounded-xl border bg-surface px-3.5 py-2.5 text-center ${
                  node.accent ? "border-s1/60 shadow-[0_0_0_3px] shadow-s1/10" : "border-line"
                }`}
              >
                <div className="text-[15px] font-medium text-ink">{node.title}</div>
                {node.detail && (
                  <div className="mt-0.5 text-sm leading-snug text-mute">{node.detail}</div>
                )}
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
