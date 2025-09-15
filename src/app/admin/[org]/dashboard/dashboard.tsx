"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { useKpi, useUser } from "@/hooks/useQuery";
import {
  KpiMetricSwitcher,
  Metric,
} from "@/app/[org]/portal/dashboard/kpi-metric-switcher";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";

export default function Dashboard() {
  const pathname = usePathname();

  // 👇 extract companyId from slug part of URL
  const orgNumber = useMemo(() => {
    if (!pathname) return undefined;
    const parts = pathname.split("/");
    const slug = parts[2]; // e.g. "devotion-ventures-5591031082"
    if (!slug) return undefined;

    const pieces = slug.split("-");
    return pieces[pieces.length - 1]; // last segment is orgNr
  }, [pathname]);

  const { data: user } = useUser();
  const { data: kpiData } = useKpi(orgNumber); // ✅ pass companyId

  const [selectedKpi, setSelectedKpi] = useState<Metric>("revenue");

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4">
          <SectionCards
            data={kpiData}
            fiscalYear={
              user && "company" in user ? user.company.fiscal_years : null
            }
          />
          <KpiMetricSwitcher
            value={selectedKpi}
            onChange={setSelectedKpi}
            className="mt-10"
          />
          <ChartAreaInteractive
            selectedKpi={selectedKpi}
            data={kpiData}
            fiscalYear={
              user && "company" in user ? user.company.fiscal_years : null
            }
          />
        </div>
      </div>
    </div>
  );
}
