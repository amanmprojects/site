/** Title, caption and an optional data table around a chart or diagram. */
export function Figure({
  title,
  caption,
  table,
  children,
}: {
  title: string;
  caption?: React.ReactNode;
  table?: { columns: string[]; rows: (string | number)[][] };
  children: React.ReactNode;
}) {
  return (
    <figure className="mt-12">
      <figcaption>
        <span className="block font-semibold text-ink">{title}</span>
        {caption && (
          <span className="mt-1 block text-[15px] leading-relaxed text-mute">
            {caption}
          </span>
        )}
      </figcaption>
      <div className="mt-5">{children}</div>
      {table && (
        <details className="mt-3 text-sm text-mute">
          <summary className="w-fit cursor-pointer select-none hover:text-ink">
            Show the data
          </summary>
          <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-line">
            <table className="w-full border-collapse text-left tabular-nums">
              <thead className="sticky top-0 bg-paper">
                <tr>
                  {table.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-line px-3 py-2 font-semibold text-ink"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-1.5">
                        {typeof cell === "number" ? cell.toLocaleString("en-US") : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </figure>
  );
}
