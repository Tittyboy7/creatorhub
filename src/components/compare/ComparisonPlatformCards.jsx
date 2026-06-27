export default function ComparisonPlatformCards({
  comparisonMetrics = [],
  metricsByPlatform = [],
}) {
  return (
    <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Available Comparison Data</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Normalized metrics from revenue, connected accounts, and product activity.
          </p>
        </div>
      </div>

      {comparisonMetrics.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Add revenue entries or connect platforms to start comparing performance.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {metricsByPlatform.map((group) => (
            <div
              key={group.platform}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold">{group.platform}</h4>

                  <p className="mt-1 text-sm text-zinc-500">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(
                      group.metrics
                        .filter((metric) => metric.metric === "revenue")
                        .reduce(
                          (sum, metric) => sum + Number(metric.value || 0),
                          0
                        )
                    )}{" "}
                    tracked revenue
                  </p>
                </div>

                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                  {group.metrics.length} metric
                  {group.metrics.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
                {group.metrics.slice(0, 4).map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                  >
                    <div>
                      <p className="font-medium">{metric.label}</p>
                      <p className="text-xs text-zinc-500">{metric.metric}</p>
                    </div>

                    <p className="font-semibold">
                      {metric.unit === "currency"
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(metric.value)
                        : metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}