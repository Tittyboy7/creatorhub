export default function getPlatformConnectionStatus(
  account
) {
  if (!account) {
    return "connected";
  }

  if (
    account.sync_status ===
    "reauth_required"
  ) {
    return "reauth_required";
  }

  if (
    account.sync_status ===
    "syncing"
  ) {
    return "syncing";
  }

  if (
    account.sync_status ===
    "error"
  ) {
    return "sync_error";
  }

  return "connected";
}