"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyKpi, getVouchers } from "@/lib/fortnox/fortnox";
import { FortnoxVoucherRow } from "@/types/fortnox";
import { type Admin, getUser, type User } from "@/lib/supabase/server";

interface GetVouchersResult {
  vouchers: FortnoxVoucherRow[];
  error: string | null;
}

export function useVouchers() {
  return useQuery<GetVouchersResult>({
    queryKey: ["vouchers"],
    queryFn: async () => {
      const res = await getVouchers();
      if (res.error) {
        throw new Error(res.error);
      }
      return res;
    },
  });
}

export function useKpi(companyId?: string) {
  return useQuery({
    queryKey: ["company_kpi", companyId ?? "self"], // 👈 include companyId in cache key
    queryFn: () => getCompanyKpi(companyId),
    enabled: companyId !== undefined || true, // still runs if no id (defaults to logged-in user)
  });
}

export function useUser() {
  return useQuery<User | Admin | null>({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
