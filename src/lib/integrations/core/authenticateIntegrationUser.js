import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function authenticateIntegrationUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: error || new Error("No authenticated user was found."),
    };
  }

  return {
    user,
    error: null,
  };
}