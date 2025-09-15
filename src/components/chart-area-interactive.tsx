"use client";

import { useState, useMemo, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrencySEK } from "@/lib/utils";
import { DatabaseFiscalYear, FortnoxKPI, FortnoxMetric } from "@/types/fortnox";

import { Metric } from "@/app/[org]/portal/dashboard/kpi-metric-switcher";
import { Loader2 } from "lucide-react";

// labels for display
const METRIC_LABELS: Record<Metric, string> = {
  revenue: "Omsättning",
  profit: "Vinst",
  costs: "Kostnader",
  grossMargin: "Bruttomarginal",
};

type Range = "fiscal" | "365d" | "90d";

function isRange(v: string): v is Range {
  return v === "fiscal" || v === "365d" || v === "90d";
}
function sum(arr: Array<{ value: number }>): number {
  return arr.reduce(
    (acc, x) => acc + (Number.isFinite(x.value) ? x.value : 0),
    0
  );
}

export function ChartAreaInteractive({
  data,
  fiscalYear,
  selectedKpi,
}: {
  data?: FortnoxKPI | null;
  fiscalYear?: DatabaseFiscalYear | DatabaseFiscalYear[] | null;
  selectedKpi: Metric;
}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState<Range>("fiscal");

  useEffect(() => {
    if (isMobile) setTimeRange("90d");
  }, [isMobile]);

  // unwrap KPI -> metric
  const safeData: FortnoxMetric = data?.[selectedKpi] ?? {
    fiscal_year_total: null,
    fiscal_monthly: [],
    last12_total: null,
    last12_monthly: [],
  };

  // FY resolution kept only for enabling the toggle
  const resolvedFY = useMemo<DatabaseFiscalYear | null>(() => {
    if (!fiscalYear) return null;
    if (Array.isArray(fiscalYear)) {
      const active = fiscalYear.find((f) => f.is_active);
      if (active) return active;
      return (
        [...fiscalYear].sort(
          (a, b) =>
            new Date(b.to_date).getTime() - new Date(a.to_date).getTime()
        )[0] ?? null
      );
    }
    return fiscalYear;
  }, [fiscalYear]);

  // Rolling 12 series
  const monthly = useMemo(
    () =>
      [...(safeData.last12_monthly ?? [])]
        .map((p) => ({
          date: `${p.month}-01`,
          value: p.revenue ?? p.profit ?? p.costs ?? p.grossMargin ?? 0,
          _month: p.month,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
    [safeData.last12_monthly]
  );

  // Fiscal series
  const fiscalSeries = useMemo(
    () =>
      [...(safeData.fiscal_monthly ?? [])]
        .map((p) => ({
          date: `${p.month}-01`,
          value: p.revenue ?? p.profit ?? p.costs ?? p.grossMargin ?? 0,
          _month: p.month,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
    [safeData.fiscal_monthly]
  );

  const filteredData = useMemo<
    Array<{ date: string; value: number; _month: string }>
  >(() => {
    switch (timeRange) {
      case "fiscal":
        return fiscalSeries;
      case "365d":
        return monthly;
      case "90d":
        return monthly.slice(-3);
    }
  }, [timeRange, fiscalSeries, monthly]);

  const total: number = useMemo(() => {
    switch (timeRange) {
      case "fiscal":
        return typeof safeData.fiscal_year_total === "number"
          ? safeData.fiscal_year_total
          : sum(fiscalSeries);
      case "365d":
        return typeof safeData.last12_total === "number"
          ? safeData.last12_total
          : sum(monthly);
      case "90d":
        return sum(filteredData);
    }
  }, [
    timeRange,
    safeData.fiscal_year_total,
    safeData.last12_total,
    fiscalSeries,
    monthly,
    filteredData,
  ]);

  const periodLabel: string = useMemo(() => {
    switch (timeRange) {
      case "fiscal":
        return "räkenskapsåret";
      case "365d":
        return "senaste 12 månaderna";
      case "90d":
        return "senaste 3 månaderna";
    }
  }, [timeRange]);

  const handleRangeChange = (v: string) => {
    if (isRange(v)) setTimeRange(v);
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col flex-wrap items-start justify-between space-y-2">
          <div>
            <CardTitle>{METRIC_LABELS[selectedKpi]}</CardTitle>
            <CardDescription>Totalt för {periodLabel}</CardDescription>
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {data?.[selectedKpi] ? (
                <>{formatCurrencySEK(total)} kr</>
              ) : (
                <Loader2 className="animate-spin h-9 w-9" />
              )}
            </div>
          </div>
        </div>

        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={handleRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem
              value="fiscal"
              disabled={!resolvedFY && !safeData.fiscal_monthly?.length}
            >
              Räkenskapsår
            </ToggleGroupItem>
            <ToggleGroupItem value="365d">12 månader</ToggleGroupItem>
            <ToggleGroupItem value="90d">3 månader</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={handleRangeChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Välj period"
            >
              <SelectValue placeholder="Välj period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem
                value="fiscal"
                disabled={!resolvedFY && !safeData.fiscal_monthly?.length}
              >
                Räkenskapsår
              </SelectItem>
              <SelectItem value="365d">12 månader</SelectItem>
              <SelectItem value="90d">3 månader</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={{
            [selectedKpi]: {
              label: METRIC_LABELS[selectedKpi],
              color: "var(--primary)",
            },
          }}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData} key={timeRange + selectedKpi}>
            <defs>
              <linearGradient
                id={`fill-${selectedKpi}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string | number) => {
                const d = new Date(String(value));
                const m = d.toLocaleDateString("sv-SE", { month: "short" });
                const y = d.getFullYear().toString().slice(-2);
                return timeRange === "365d" ? `${m} ${y}` : m;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string | number) =>
                    new Date(String(value)).toLocaleDateString("sv-SE", {
                      year: "numeric",
                      month: "long",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              connectNulls
              fill={`url(#fill-${selectedKpi})`}
              stroke="var(--primary)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
