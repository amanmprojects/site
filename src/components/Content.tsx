export function Content({ children }: { children: React.ReactNode }) {
  return (
    <main className="grow overflow-hidden px-6 pb-24 md:pb-0">
      <div className="mx-auto max-w-xl py-24 sm:py-32">{children}</div>
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
