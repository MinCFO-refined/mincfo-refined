import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrencySEK } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { DatabaseFiscalYear, FortnoxKPI, FortnoxMetric } from "@/types/fortnox";

// Helper to render one KPI card
function KpiCard({
  label,
  metric,
  data,
  trend = "up",
}: {
  label: string;
  metric: keyof FortnoxKPI;
  data?: FortnoxKPI | null;
  trend?: "up" | "down";
}) {
  const metricData: FortnoxMetric | undefined | null = data?.[metric];

  const Icon = trend === "up" ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-col gap-2">
        {/* Row: label + badge */}
        <div className="flex w-full items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <CardAction>
            <Badge variant="outline">
              <Icon />
              N/A
            </Badge>
          </CardAction>
        </div>

        {/* Value */}
        <CardTitle className="text-2xl font-semibold tabular-nums @[260px]/card:text-3xl">
          {metricData ? (
            <>{formatCurrencySEK(metricData.fiscal_year_total ?? 0)} kr</>
          ) : (
            <Loader2 className="animate-spin h-9 w-9" />
          )}
        </CardTitle>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          N/A <Icon className="size-4" />
        </div>
        <div className="text-muted-foreground">N/A</div>
      </CardFooter>
    </Card>
  );
}

export function SectionCards({
  data,
  fiscalYear,
}: {
  data?: FortnoxKPI | null;
  fiscalYear?: DatabaseFiscalYear | DatabaseFiscalYear[] | null;
}) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <KpiCard label="Omsättning" metric="revenue" data={data} trend="up" />
      <KpiCard label="Vinst" metric="profit" data={data} trend="up" />
      <KpiCard label="Kostnader" metric="costs" data={data} trend="down" />
      <KpiCard
        label="Bruttomarginal"
        metric="grossMargin"
        data={data}
        trend="up"
      />
    </div>
  );
}
