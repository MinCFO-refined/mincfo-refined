"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

import { SectionCards } from "@/components/section-cards";
import { useRevenue, useUser } from "@/hooks/useQuery";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: revenue, isLoading: revenueLoading } = useRevenue();
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4">
          <SectionCards />

          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  );
}
