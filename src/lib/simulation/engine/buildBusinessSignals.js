export default function buildBusinessSignals(creator) {
  const youtube = creator.platforms.youtube;

  if (!youtube) {
    return {};
  }

  const current = youtube.currentPeriod;
  const previous = youtube.previousPeriod;

  function percentChange(currentValue, previousValue) {
    if (!previousValue) return 0;

    return (
      ((currentValue - previousValue) / previousValue) *
      100
    );
  }

  return {
    youtube: {
      viewsChange: percentChange(
        current.views,
        previous.views
      ),

      watchTimeChange: percentChange(
        current.watchTimeHours,
        previous.watchTimeHours
      ),

      subscriberGrowthChange: percentChange(
        current.netSubscriberGrowth,
        previous.netSubscriberGrowth
      ),

      revenueChange: percentChange(
        current.estimatedRevenue,
        previous.estimatedRevenue
      ),
    },
  };
}