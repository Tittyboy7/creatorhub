export async function getOwnedConnectedAccount({
  supabaseAdmin,
  connectedAccountId,
  userId,
  platform,
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

  const { data: account, error } = await supabaseAdmin
    .from("connected_accounts")
    .select("*")
    .eq("id", connectedAccountId)
    .eq("user_id", userId)
    .eq("platform", platform)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to retrieve the ${platform} connected account.`
    );
  }

  return account || null;
}