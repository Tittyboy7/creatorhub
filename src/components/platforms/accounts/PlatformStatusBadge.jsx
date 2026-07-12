function getStatusConfig({ account, platform }) {
  if (account?.sync_error) {
    return {
      label: "Error",
      className: "bg-red-950 text-red-400",
    };
  }

  if (account?.last_synced_at) {
    return {
      label: "Synced",
      className: "bg-green-950 text-green-400",
    };
  }

  if (account) {
    return {
      label: "Connected",
      className: "bg-green-950 text-green-400",
    };
  }

  if (platform.available) {
    return {
      label: "Available",
      className: "bg-blue-950 text-blue-400",
    };
  }

  return {
    label: "Coming Soon",
    className: "bg-zinc-800 text-zinc-400",
  };
}

export default function PlatformStatusBadge({ account, platform }) {
  const status = getStatusConfig({ account, platform });

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
    >
      {status.label}
    </span>
  );
}