import Link from "next/link";
import { formatMonth } from "@/lib/formatMonth";
import { formatCurrency } from "@/lib/formatCurrency";

export default function RevenueTimeline({
  filteredEntries,
  entriesByMonth,
  handleDeleteEntry,
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Revenue Timeline</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Monthly grouped revenue entries.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/add-revenue"
            className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
          >
            Add Revenue
          </Link>

          <Link
            href="/import-revenue"
            className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
          >
            Import CSV
          </Link>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <h3 className="text-xl font-bold">No revenue entries found</h3>

          <p className="mx-auto mt-2 max-w-xl text-zinc-400">
            Add revenue manually or import a CSV to start tracking your creator
            business income.
          </p>

          <Link
            href="/add-revenue"
            className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
          >
            Add First Revenue Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(entriesByMonth).map(([month, monthEntries]) => (
            <div
              key={month}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {month === "Unknown" ? "Unknown Month" : formatMonth(month)}
                </h3>

                <p className="text-sm text-zinc-500">
                  {formatCurrency(
                    monthEntries.reduce(
                      (sum, entry) => sum + Number(entry.amount || 0),
                      0
                    )
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {monthEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">
                          {entry.platform}
                        </h4>

                        <p className="mt-1 text-sm text-zinc-400">
                          {entry.revenue_type}
                        </p>

                        {entry.notes && (
                          <p className="mt-3 text-sm text-zinc-500">
                            {entry.notes}
                          </p>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <p className="text-2xl font-bold">
                          {formatCurrency(entry.amount)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 sm:justify-end">
                          <Link
                            href={`/edit-revenue/${entry.id}`}
                            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="rounded-xl border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}