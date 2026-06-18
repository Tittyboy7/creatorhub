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

    case "warning":
      return "bg-yellow-950 text-yellow-400 border border-yellow-800";

    case "moderation":
      return "bg-red-950 text-red-400 border border-red-800";

    case "appeal":
      return "bg-cyan-950 text-cyan-400 border border-cyan-800";

    case "verification":
      return "bg-green-950 text-green-400 border border-green-800";

    case "product":
      return "bg-orange-950 text-orange-400 border border-orange-800";

    case "general":
      return "bg-zinc-800 text-zinc-300 border border-zinc-700";

    default:
      return "bg-zinc-800 text-zinc-300 border border-zinc-700";
  }
}