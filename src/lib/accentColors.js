export function getAccentBadgeClass(accentColor) {
  switch (accentColor) {
    case "blue":
      return "bg-blue-500 text-white";

    case "purple":
      return "bg-purple-500 text-white";

    case "green":
      return "bg-green-500 text-white";

    case "pink":
      return "bg-pink-500 text-white";

    case "orange":
      return "bg-orange-500 text-white";

    case "red":
      return "bg-red-500 text-white";

    default:
      return "bg-white text-black";
  }
}

export function getAccentBorderClass(accentColor) {
  switch (accentColor) {
    case "blue":
      return "border-blue-500";

    case "purple":
      return "border-purple-500";

    case "green":
      return "border-green-500";

    case "pink":
      return "border-pink-500";

    case "orange":
      return "border-orange-500";

    case "red":
      return "border-red-500";

    default:
      return "border-white";
  }
}

export function getAccentButtonClass(accentColor) {
  switch (accentColor) {
    case "blue":
      return "bg-blue-500 text-white hover:bg-blue-600";

    case "purple":
      return "bg-purple-500 text-white hover:bg-purple-600";

    case "green":
      return "bg-green-500 text-white hover:bg-green-600";

    case "pink":
      return "bg-pink-500 text-white hover:bg-pink-600";

    case "orange":
      return "bg-orange-500 text-white hover:bg-orange-600";

    case "red":
      return "bg-red-500 text-white hover:bg-red-600";

    default:
      return "bg-white text-black hover:bg-zinc-200";
  }
}