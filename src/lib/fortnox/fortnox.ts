"use server";

import { createClient, getUser, User } from "../supabase/server";
import { FortnoxVoucherRow } from "./types";

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

export async function getVouchers() {
  const user = (await getUser()) as User | null;
  if (!user) {
    return { vouchers: [], error: "User or company not found" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fortnox_vouchers")
    .select(
      `
      *,
      fortnox_voucher_transactions (*)
    `
    )
    .eq("company_id", user.company.id)
    .order("transaction_date", { ascending: false });
  if (error) {
    console.error("❌ Error fetching vouchers:", error.message);
    return { vouchers: [], error: error.message };
  }
  console.log(data);
  return { vouchers: (data ?? []) as FortnoxVoucherRow[], error: null };
}

export async function getCompanyRevenue(startDate?: string, endDate?: string) {
  const user = (await getUser()) as User | null;
  if (!user || !user.company?.id) throw new Error("User or company not found");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_company_revenue", {
    p_company_id: user.company.id, // always from server-side user
    p_start_date: startDate ?? undefined,
    p_end_date: endDate ?? undefined,
  });

  if (error) {
    console.error("❌ Error fetching revenue:", error.message);
    throw error;
  }
  console.log(data);

  return data as number; // revenue is numeric in Postgres
}
