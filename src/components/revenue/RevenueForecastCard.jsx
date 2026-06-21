import ForecastCard from "./ForecastCard";
import { formatCurrency } from "@/lib/formatCurrency";

export default function RevenueForecastCard({
  averageMonthlyRevenue,
  projectedAnnualRevenue,
  projectedNextMonthRevenue,
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5">
      <h2 className="text-2xl font-bold">Revenue Forecast</h2>

      <p className="mt-1 text-sm text-zinc-500">
        Estimated performance from tracked revenue.
      </p>

      <div className="mt-4 grid gap-3">
        <ForecastCard
          label="Monthly Average"
          value={formatCurrency(averageMonthlyRevenue)}
        />

        <ForecastCard
          label="Projected Annual"
          value={formatCurrency(projectedAnnualRevenue)}
        />

        <ForecastCard
          label="Next Month"
          value={formatCurrency(projectedNextMonthRevenue)}
        />
      </div>
    </div>
  );
}