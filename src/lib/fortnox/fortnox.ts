"use server";

import { createClient, getUser } from "../supabase/server";

export async function connectToFortnox(): Promise<{
  connected: boolean;
  error: string | null;
}> {
  const user = await getUser();
  if (!user) {
    return { connected: false, error: "User not logged in" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fortnox_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking integration:", error);
    return { connected: false, error: error.message };
  }

  return { connected: !!data, error: null };
}
