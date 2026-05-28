export function getNotificationTypeClass(type) {
  switch (type) {
    case "follow":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/30";

    case "favorite":
      return "bg-pink-500/10 text-pink-400 border border-pink-500/30";

    case "review":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";

    case "cart":
      return "bg-green-500/10 text-green-400 border border-green-500/30";

    case "revenue":
      return "bg-purple-500/10 text-purple-400 border border-purple-500/30";

    default:
      return "bg-zinc-800 text-zinc-300";
  }
}