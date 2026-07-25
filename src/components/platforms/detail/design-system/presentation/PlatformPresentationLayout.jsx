export function PlatformInsightsPresentation({
  visualization,
  metrics,
  insight,
  secondaryContent = null,
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <div className="min-w-0">{visualization}</div>

        <div className="min-w-0">{metrics}</div>
      </div>

      {secondaryContent ? (
        <div className="min-w-0">
          {secondaryContent}
        </div>
      ) : null}

      <div className="min-w-0">{insight}</div>
    </div>
  );
}

export function PlatformAnalyticsPresentation({
  summary,
  visualization,
  metrics,
  analysis,
  secondaryContent = null,
}) {
  return (
    <div className="space-y-5">
      {summary ? (
        <div className="min-w-0">{summary}</div>
      ) : null}

      <div className="min-w-0">{visualization}</div>

      <div className="min-w-0">{metrics}</div>

      {secondaryContent ? (
        <div className="min-w-0">
          {secondaryContent}
        </div>
      ) : null}

      {analysis ? (
        <div className="min-w-0">{analysis}</div>
      ) : null}
    </div>
  );
}