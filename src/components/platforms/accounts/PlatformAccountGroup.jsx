import Link from "next/link";
import ConnectedAccountCard from "./ConnectedAccountCard";
import PlatformStatusBadge from "./PlatformStatusBadge";

export default function PlatformAccountGroup({
  platform,
  accounts,
  syncingAccountId,
  onSync,
}) {
  const PlatformIcon = platform.icon;
  const connectedCount = accounts.length;
  const hasAccounts = connectedCount > 0;
  const statusAccount = hasAccounts
    ? {
        sync_error:
          accounts.find((account) => account.sync_error)?.sync_error || null,
        last_synced_at:
        accounts.every((account) => account.last_synced_at)
          ? accounts[0]?.last_synced_at
          : null,
      }
    : null;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl"
            style={{
              color: platform.brandColor || "#a1a1aa",
              borderColor: platform.brandColor
                ? `${platform.brandColor}4D`
                : "#3f3f46",
              backgroundColor: platform.brandColor
                ? `${platform.brandColor}1A`
                : "#18181b",
            }}
          >
            {PlatformIcon ? (
              <PlatformIcon aria-hidden="true" />
            ) : (
              <span className="text-sm font-bold">
                {platform.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-white">
                {platform.name}
              </h2>

              {hasAccounts && (
                <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-400">
                  {connectedCount}{" "}
                  {connectedCount === 1
                    ? platform.connectionLabel
                    : platform.connectionLabelPlural}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {platform.description}
            </p>
          </div>
        </div>

        <PlatformStatusBadge
          account={statusAccount}
          platform={platform}
        />
      </div>

      {hasAccounts ? (
        <div className="mt-5 space-y-3">
          {accounts.map((account) => (
            <ConnectedAccountCard
              key={account.id}
              account={account}
              platform={platform}
              syncing={syncingAccountId === account.id}
              onSync={onSync}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm font-semibold text-white">
            No connected {platform.connectionLabelPlural.toLowerCase()}
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Connect {platform.name} to begin syncing available creator-business data.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {platform.available ? (
          <Link
            href={`/connected-accounts/${platform.key}`}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            {hasAccounts
              ? `Connect another ${platform.connectionLabel.toLowerCase()}`
              : `Connect ${platform.name}`}
          </Link>
        ) : (
          <span className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-500">
            Coming Soon
          </span>
        )}

        {hasAccounts &&
          platform.intelligenceAvailable &&
          platform.detailRoute && (
          <Link
            href={platform.detailRoute}
            className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            Open {platform.name} Intelligence
          </Link>
        )}
      </div>
    </section>
  );
}