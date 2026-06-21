import RevenueDonutCard from "./RevenueDonutCard";
import PlatformHealthSection from "./PlatformHealthSection";
import MonthlyRevenueChart from "./MonthlyRevenueChart";
import RevenueForecastCard from "./RevenueForecastCard";
import UpcomingPayoutsCard from "./UpcomingPayoutsCard";

export default function RevenueMainContent({
  platformChartData,
  revenueTypeChartData,
  totalRevenue,
  chartColors,
  visibleWidgets,
  platformHealthCards,
  chartType,
  setChartType,
  recentMonthlyChartData,
  averageMonthlyRevenue,
  projectedAnnualRevenue,
  projectedNextMonthRevenue,
  upcomingPayouts,
}) {
  return (
    <main className="min-w-0 space-y-5">
      <section className="grid gap-5 xl:grid-cols-2">
        <RevenueDonutCard
          title="Revenue Share"
          description="Compare revenue by platform."
          data={platformChartData}
          nameKey="platform"
          totalRevenue={totalRevenue}
          chartColors={chartColors}
        />

        <RevenueDonutCard
          title="Revenue Type Breakdown"
          description="Compare revenue by category."
          data={revenueTypeChartData}
          nameKey="type"
          totalRevenue={totalRevenue}
          chartColors={chartColors}
        />
      </section>

      {visibleWidgets.platformHealth && (
        <PlatformHealthSection platformHealthCards={platformHealthCards} />
      )}

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.8fr]">
        <div>
          <MonthlyRevenueChart
            chartType={chartType}
            setChartType={setChartType}
            recentMonthlyChartData={recentMonthlyChartData}
          />
        </div>

        <div className="space-y-5">
          {visibleWidgets.revenueForecast && (
            <RevenueForecastCard
              averageMonthlyRevenue={averageMonthlyRevenue}
              projectedAnnualRevenue={projectedAnnualRevenue}
              projectedNextMonthRevenue={projectedNextMonthRevenue}
            />
          )}

          {visibleWidgets.upcomingPayouts && (
            <UpcomingPayoutsCard payouts={upcomingPayouts} />
          )}
        </div>
      </section>
    </main>
  );
}