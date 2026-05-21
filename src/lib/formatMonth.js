export function formatMonth(monthString) {
  if (!monthString) return "";

  const [year, month] = monthString.split("-");
  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}