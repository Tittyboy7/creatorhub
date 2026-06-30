export default function BuilderSection({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white">{title}</h3>

        {description && (
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}