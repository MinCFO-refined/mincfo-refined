import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Admin, Profile } from "./supabase/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function isAdmin(profile: Profile | null): profile is Admin["profile"] {
  return (
    !!profile &&
    profile.is_admin === true &&
    profile.email === "admin@mincfo.com"
  );
}

export function safeFormatOrgNumber(input: string | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 10) return digits; // not ready yet

  return digits.slice(0, 6) + "-" + digits.slice(6);
}
