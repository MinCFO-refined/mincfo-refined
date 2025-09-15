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

export function formatCurrencySEK(amount: number): string {
  // Format with up to 2 decimals, but don't force them
  return new Intl.NumberFormat("sv-SE", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // remove diacritics
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}
