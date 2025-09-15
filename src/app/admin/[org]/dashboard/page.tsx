// app/dashboard/page.tsx
import Dashboard from "./dashboard";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getUser } from "@/lib/supabase/server";
import { getCompanyKpi } from "@/lib/fortnox/fortnox";

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  // prefetch both queries on the server
  await queryClient.prefetchQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });

  await queryClient.prefetchQuery({
    queryKey: ["company_kpi"],
    queryFn: () => getCompanyKpi(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Dashboard />
    </HydrationBoundary>
  );
}
