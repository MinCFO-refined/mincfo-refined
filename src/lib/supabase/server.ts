import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

// Define the profile type based on your database schema
export interface Profile {
  id: string;
  first_name?: string;
  // last_name?: string;
  email?: string;
  // avatar_url?: string;
  // role?: string;
  created_at?: string;
  updated_at?: string;
  company_i?: string;
  is_admin: boolean;
  // Add other fields as needed based on your profiles table
}

export interface UserWithProfile extends User {
  profile?: Profile;
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
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

export async function getUser(): Promise<UserWithProfile | null> {
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
    console.warn("Failed to fetch user profile:", profileError.message);

    return user as UserWithProfile;
  }

  return {
    ...user,
    profile,
  } as UserWithProfile;
}
