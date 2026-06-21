import { formatCurrency } from "@/lib/formatCurrency";

export default function UpcomingPayoutsCard({ payouts }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Upcoming Payouts</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Estimated payouts from connected platforms.
        </p>
      </div>

      <div className="space-y-3">
        {payouts.map((payout) => (
          <div
            key={payout.platform}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{payout.platform}</p>
                <p className="mt-1 text-xs text-zinc-500">{payout.date}</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold">
                  {formatCurrency(payout.amount)}
                </p>
                <p className="text-xs text-zinc-500">{payout.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}