export async function updateIntegrationSyncStatus({
  supabaseAdmin,
  connectedAccountId,
  userId,
  platform,
  updates = {},
}) {
  if (!supabaseAdmin) {
    throw new Error("Missing Supabase admin client.");
  }

  if (!connectedAccountId) {
    throw new Error("Missing connected account ID.");
  }

  if (!userId) {
    throw new Error("Missing authenticated user ID.");
  }

  if (!platform) {
    throw new Error("Missing platform key.");
  }

  const timestamp = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from("connected_accounts")
    .update({
      last_sync_attempt_at: timestamp,
      updated_at: timestamp,
      ...updates,
    })
    .eq("id", connectedAccountId)
    .eq("user_id", userId)
    .eq("platform", platform);

  if (error) {
    throw new Error(
      `Failed to update the ${platform} integration sync status.`
    );
  }
}