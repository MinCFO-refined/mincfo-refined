"use server";

import { Company } from "@/types/fortnox";
import { createClient, getUser } from "./supabase/server";

export async function fetchCompanies(): Promise<Company[]> {
  const user = await getUser();
  if (!user?.profile?.is_admin) return [];
  const supabase = await createClient();
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*");
  if (error) {
    console.error(error);
    return [];
  }
  if (!companies?.length) return [];
  return companies;
}
