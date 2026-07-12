function formatDate(value) {
  if (!value) return "Not synced yet";

  return new Date(value).toLocaleString();
}

export default function ConnectedAccountCard({
  account,
  platform,
  syncing,
  onSync,
}) {
  const accountName =
    account.account_name ||
    account.account_id ||
    `${platform.name} ${platform.connectionLabel}`;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {platform.connectionLabel}
          </p>

          <h3 className="mt-1 truncate text-lg font-bold text-white">
            {accountName}
          </h3>

          <p className="mt-1 break-all text-xs text-zinc-600">
            {account.account_id}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSync(account)}
          disabled={syncing}
          className="shrink-0 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500">Status</p>

          <p
            className={`mt-1 text-sm font-semibold capitalize ${
              account.sync_error ? "text-red-400" : "text-white"
            }`}
          >
            {account.sync_error ? "Error" : account.sync_status || "Connected"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500">Last Sync</p>

          <p className="mt-1 text-sm font-semibold text-white">
            {formatDate(account.last_synced_at)}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500">Last Attempt</p>

          <p className="mt-1 text-sm font-semibold text-white">
            {account.last_sync_attempt_at
              ? formatDate(account.last_sync_attempt_at)
              : "No attempts yet"}
          </p>
        </div>
      </div>

      {account.sync_error && (
  <div className="mt-3 rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-400">
    Sync error: {account.sync_error}
  </div>
)}
    </div>
  );
}