import { formatCurrency } from "@/lib/formatCurrency";

export function buildGoalCards({ totalRevenue, revenueGoal }) {
  return [
    {
      label: "Revenue Goal",
      current: totalRevenue,
      goal: revenueGoal,
      display: `${formatCurrency(totalRevenue)} / ${formatCurrency(revenueGoal)}`,
    },
    {
      label: "Subscriber Goal",
      current: 0,
      goal: 1000,
      display: "Coming soon / 1,000",
    },
    {
      label: "Product Goal",
      current: 0,
      goal: 25,
      display: "Coming soon / 25",
    },
    {
      label: "Stream Hours Goal",
      current: 0,
      goal: 100,
      display: "Coming soon / 100 hrs",
    },
  ];
}