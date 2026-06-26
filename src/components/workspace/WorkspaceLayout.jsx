export default function WorkspaceLayout({
  eyebrow,
  title,
  description,
  sidebar,
  children,
}) {
  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-6 text-white md:px-10 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 md:p-8">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-2 text-4xl font-bold">{title}</h1>

          {description && (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
              {description}
            </p>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {sidebar && (
            <aside className="h-fit rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
              {sidebar}
            </aside>
          )}

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}