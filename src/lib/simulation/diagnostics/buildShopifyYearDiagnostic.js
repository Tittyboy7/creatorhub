function round(
  value,
  decimals = 0
) {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      (value || 0) *
        multiplier
    ) / multiplier
  );
}

function sum(
  days,
  getter
) {
  return days.reduce(
    (total, day) =>
      total +
      (getter(day) || 0),
    0
  );
}

function average(
  days,
  getter
) {
  if (!days.length) {
    return 0;
  }

  return (
    sum(days, getter) /
    days.length
  );
}

function getShopifyDays(
  dailySimulation
) {
  return (
    dailySimulation?.days ||
    dailySimulation?.dailyHistory ||
    []
  ).filter(
    (day) =>
      day?.shopify
  );
}

function buildPeriodSummary(
  days
) {
  if (!days.length) {
    return null;
  }

  const orders =
    sum(
      days,
      (day) =>
        day.shopify.orders
    );

  const unitsSold =
    sum(
      days,
      (day) =>
        day.shopify.unitsSold
    );

  const grossSales =
    sum(
      days,
      (day) =>
        day.shopify.grossSales
    );

  const sessions =
    sum(
      days,
      (day) =>
        day.shopify.sessions
    );

  const conversionRate =
    sessions > 0
      ? (orders / sessions) * 100
      : 0;

  return {
    startDate:
      days[0].date,

    endDate:
      days[
        days.length - 1
      ].date,

    days:
      days.length,

    sessions,

    orders,

    unitsSold,

    grossSales,

    averageDailyOrders:
      round(
        average(
          days,
          (day) =>
            day.shopify.orders
        ),
        2
      ),

    averageDailyGrossSales:
      round(
        average(
          days,
          (day) =>
            day.shopify.grossSales
        ),
        2
      ),

    conversionRate:
      round(
        conversionRate,
        2
      ),

    averageUnitsPerOrder:
      orders > 0
        ? round(
            unitsSold /
              orders,
            2
          )
        : 0,

    averageOrderValue:
      orders > 0
        ? round(
            grossSales /
              orders,
            2
          )
        : 0,
  };
}

function getCommerceEvents(
  days
) {
  return days.flatMap(
    (day) =>
      (day.events || [])
        .filter(
          (event) =>
            event.type ===
            "merchandise_launch"
        )
        .map((event) => ({
          date: day.date,

          orders:
            day.shopify.orders,

          grossSales:
            day.shopify
              .grossSales,

          conversionRate:
            round(
              day.shopify
                .conversionRate,
              2
            ),

          commerceMomentum:
            round(
              day.momentum
                ?.commerce || 0,
              3
            ),

          event: event.label,
        }))
  );
}

function getExtremeDay(
  days,
  getter,
  direction = "highest"
) {
  if (!days.length) {
    return null;
  }

  return days.reduce(
    (selected, day) => {
      if (!selected) {
        return day;
      }

      const selectedValue =
        getter(selected);

      const dayValue =
        getter(day);

      if (
        direction === "lowest"
      ) {
        return dayValue <
          selectedValue
          ? day
          : selected;
      }

      return dayValue >
        selectedValue
        ? day
        : selected;
    },
    null
  );
}

function summarizeDay(day) {
  if (!day?.shopify) {
    return null;
  }

  return {
    date:
      day.date,

    sessions:
      day.shopify.sessions,

    conversionRate:
      round(
        day.shopify
          .conversionRate,
        2
      ),

    orders:
      day.shopify.orders,

    unitsSold:
      day.shopify.unitsSold,

    averageOrderValue:
      round(
        day.shopify
          .averageOrderValue,
        2
      ),

    grossSales:
      day.shopify.grossSales,

    commerceMomentum:
      round(
        day.momentum
          ?.commerce || 0,
        3
      ),

    events:
      (day.events || []).map(
        (event) =>
          event.type
      ),
  };
}

export default function buildShopifyYearDiagnostic(
  dailySimulation
) {
  const days =
    getShopifyDays(
      dailySimulation
    );

  if (!days.length) {
    return null;
  }

  const last28Days =
    days.slice(-28);

  const previous28Days =
    days.slice(-56, -28);

  const highestSalesDay =
    getExtremeDay(
      days,
      (day) =>
        day.shopify
          .grossSales
    );

  const highestOrderDay =
    getExtremeDay(
      days,
      (day) =>
        day.shopify.orders
    );

  const lowestSalesDay =
    getExtremeDay(
      days,
      (day) =>
        day.shopify
          .grossSales,
      "lowest"
    );

  return {
    totalDays:
      days.length,

    fullYear:
      buildPeriodSummary(
        days
      ),

    first28Days:
      buildPeriodSummary(
        days.slice(0, 28)
      ),

    previous28Days:
      buildPeriodSummary(
        previous28Days
      ),

    current28Days:
      buildPeriodSummary(
        last28Days
      ),

    extremes: {
      highestSalesDay:
        summarizeDay(
          highestSalesDay
        ),

      highestOrderDay:
        summarizeDay(
          highestOrderDay
        ),

      lowestSalesDay:
        summarizeDay(
          lowestSalesDay
        ),
    },

    merchandiseEvents:
      getCommerceEvents(
        days
      ),
  };
}