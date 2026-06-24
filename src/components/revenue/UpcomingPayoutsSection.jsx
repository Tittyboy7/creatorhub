import InfoTooltip from "./InfoTooltip";
import { formatCurrency } from "@/lib/formatCurrency";
import CardShell from "@/components/ui/CardShell";
import EmptyState from "@/components/ui/EmptyState";

function PayoutCard({ platform, amount, timing, status }) {
  return (
    <CardShell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">{platform}</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(amount)}</p>
        </div>

        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
          {status}
        </span>
      </div>

      <p className="mt-3 text-sm text-zinc-400">{timing}</p>
    </CardShell>
  );
}

export default function UpcomingPayoutsSection({ upcomingPayouts = [] }) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      {upcomingPayouts.length === 0 ? (
        <EmptyState
          title="No upcoming payouts yet"
          description="Sync payment platforms to start tracking expected payouts."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {upcomingPayouts.map((payout) => (
            <PayoutCard
              key={`${payout.platform}-${payout.timing}`}
              platform={payout.platform}
              amount={payout.amount}
              timing={payout.timing}
              status={payout.status}
            />
          ))}
        </div>
      )}
    </section>
  );
}