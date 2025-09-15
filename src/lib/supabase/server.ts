"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { Company } from "@/types/fortnox";
import { isAdmin } from "../utils";
import { FortnoxFinancialYear } from "@/types/fortnox";

// Define the profile type based on your database schema
export interface Profile {
  id: string;
  first_name: string | null;
  // last_name: string;
  email: string;
  // avatar_url?: string;
  // role?: string;
  created_at: string;
  updated_at: string;
  company_id?: string | null;
  is_admin: boolean;
  // Add other fields as needed based on your profiles table
}

export interface User extends SupabaseUser {
  profile?: Profile;
  company: Company;
  fiscalYear?: FortnoxFinancialYear;
}

export interface Admin extends SupabaseUser {
  profile: Profile & { is_admin: true; email: "admin@mincfo.com" };
  companies: Company[];
}
export type AppUser = User | Admin;
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function getUser(): Promise<User | Admin | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    console.error("Failed to fetch profile:", profileError.message);
    return null;
  }

  // companies query
  const query = supabase.from("companies").select("*");

  if (isAdmin(profile)) {
    // 👑 admin → fetch all companies + their fiscal years
    const { data: companies } = await query;

    let companiesWithYears = companies ?? [];

    if (companiesWithYears.length > 0) {
      const companyIds = companiesWithYears.map((c) => c.id);

      const { data: fiscalYears } = await supabase
        .from("fiscal_years")
        .select("*")
        .in("company_id", companyIds);

      // merge fiscal years into each company
      companiesWithYears = companiesWithYears.map((c) => ({
        ...c,
        fiscal_years: fiscalYears?.filter((fy) => fy.company_id === c.id) ?? [],
      }));
    }

    return { ...user, profile, companies: companiesWithYears } as Admin;
  } else {
    // 🙋 normal user → fetch their single company
    const { data: company, error: companyError } = await query
      .eq("user_id", user.id)
      .single();
    if (!company || companyError) {
      console.error(
        "No company found for user:",
        user.id,
        companyError?.message
      );
      return null; // bail out → no User without a Company
    }
    const { data: fiscalYears } = await supabase
      .from("fiscal_years")
      .select("*")
      .eq("company_id", company.id);

    return {
      ...user,
      profile,
      company: { ...company, fiscal_years: fiscalYears ?? [] },
    } as User;
  }
}
