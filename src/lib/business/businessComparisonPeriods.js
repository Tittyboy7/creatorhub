export const businessComparisonPeriods = {
  today: {
    key: "today",
    label: "Today",
    comparisonLabel: "Yesterday",
    comparisonType: "previous_period",
  },

  "7d": {
    key: "7d",
    label: "Last 7 Days",
    comparisonLabel: "Previous 7 Days",
    comparisonType: "previous_period",
  },

  "30d": {
    key: "30d",
    label: "Last 30 Days",
    comparisonLabel: "Previous 30 Days",
    comparisonType: "previous_period",
  },

  "90d": {
    key: "90d",
    label: "Last 90 Days",
    comparisonLabel: "Previous 90 Days",
    comparisonType: "previous_period",
  },

  "12m": {
    key: "12m",
    label: "Last 12 Months",
    comparisonLabel: "Previous 12 Months",
    comparisonType: "previous_period",
  },

  all: {
    key: "all",
    label: "All Time",
    comparisonLabel: null,
    comparisonType: null,
  },

  month_over_month: {
    key: "month_over_month",
    label: "This Month",
    comparisonLabel: "Previous Month",
    comparisonType: "calendar_period",
  },
};

export function getBusinessComparisonPeriod(periodKey) {
  return businessComparisonPeriods[periodKey] || null;
}