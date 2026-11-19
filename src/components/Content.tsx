export function Content({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  /** Room for card grids and charts */
  wide?: boolean;
}) {
  return (
    <main className="grow overflow-hidden px-6 pb-24 md:pb-0">
      <div
        className={`page-enter mx-auto py-24 sm:py-32 ${wide ? "max-w-2xl" : "max-w-xl"}`}
      >
        {children}
      </div>
    </main>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wider text-mute">
      {children}
    </h2>
  );
}
