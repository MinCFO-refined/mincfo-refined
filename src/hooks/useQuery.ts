"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyRevenue, getVouchers } from "@/lib/fortnox/fortnox";
import { FortnoxVoucherRow } from "@/lib/fortnox/types";
import { getUser } from "@/lib/supabase/server";

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

export function useRevenue() {
  return useQuery({
    queryKey: ["revenue"],
    queryFn: () => getCompanyRevenue(),
  });
}

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
