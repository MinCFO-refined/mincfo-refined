"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { Company } from "@/types/fortnox";
import { isAdmin } from "../utils";
import resend, { Resend } from "resend";
import { supabaseAdmin } from "./supabase-admin";
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

export async function inviteUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // mark as confirmed so they can log in immediately
  });
  if (error) {
    console.error(
      "Supabase createUser failed:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Ditt konto för MinCFO",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
          
        
          <div style="background: #4b3cfe; padding: 24px; text-align: center;">
           
          </div>

       
          <div style="padding: 32px; color: #333;">
            <h2 style="margin: 0 0 16px; font-size: 20px; color: #111;">Välkommen till MinCFO!</h2>
            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5;">
              Ett konto har skapats åt dig. Använd lösenordet nedan för att logga in första gången.
              Du kan sedan byta lösenord i portalen.
            </p>

            <div style="background: #f2efe9; padding: 16px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; letter-spacing: 1px;">
              ${password}
            </div>

            <p style="margin: 24px 0 0; font-size: 13px; color: #666; line-height: 1.5;">
              Logga in på <a href="${
                process.env.NEXT_PUBLIC_APP_URL
              }/auth/login" style="color: #0070f3; text-decoration: none;">${
      process.env.NEXT_PUBLIC_APP_URL
    }/auth/login</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} MinCFO. Alla rättigheter förbehållna.
          </div>
        </div>
      </div>
    `,
  });

  return data;
}
