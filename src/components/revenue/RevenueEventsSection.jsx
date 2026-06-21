import { formatCurrency } from "@/lib/formatCurrency";

export default function RevenueEventsSection({ events }) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Revenue Events</h2>

          <p className="mt-1 text-sm text-zinc-500">
            API-powered business activity feed for payouts, spikes, milestones,
            and platform events.
          </p>
        </div>

        <span className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">
          API Event Slot
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {events.map((event) => (
          <div
            key={`${event.platform}-${event.title}`}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {event.platform}
                </p>

                <h3 className="mt-1 text-lg font-bold">{event.title}</h3>
              </div>

              <span className="rounded-xl border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                {event.type}
              </span>
            </div>

            <p className="text-2xl font-bold">{formatCurrency(event.amount)}</p>
            <p className="mt-1 text-xs text-zinc-500">{event.date}</p>
            <p className="mt-3 text-sm text-zinc-400">{event.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}