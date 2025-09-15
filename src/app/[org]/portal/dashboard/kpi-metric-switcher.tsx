"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

export type Metric = "revenue" | "profit" | "costs" | "grossMargin";

export const OPTIONS: {
  value: Metric;
  label: string;
}[] = [
  { value: "revenue", label: "Omsättning" },
  { value: "profit", label: "Vinst" },
  { value: "costs", label: "Kostnader" },
  { value: "grossMargin", label: "Bruttomarginal" },
];

type Props = {
  value?: Metric;

  onChange?: (value: Metric) => void;
  className?: string;
};

export function KpiMetricSwitcher({ value, onChange, className }: Props) {
  const [internal, setInternal] = useState<Metric>(value ?? "revenue");
  const current = value ?? internal;

  const handleChange = (v: string) => {
    if (!v) return;

    (onChange ?? setInternal)(v as Metric);
  };

  return (
    <Card className={cn("@container/card", className)}>
      <CardHeader>
        <div className="flex w-full items-start justify-between gap-2">
          <div>
            <CardTitle>Ändra vy</CardTitle>
            <CardDescription>
              Välj vilket nyckeltal som visas nedan
            </CardDescription>
          </div>

          <CardAction>
            {/* Desktop: segmented toggle */}
            <ToggleGroup
              type="single"
              value={current}
              onValueChange={handleChange}
              variant="outline"
              className="hidden @[767px]/card:flex"
            >
              {OPTIONS.map(({ value, label }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className={cn(
                    "px-3", // default
                    value === "revenue" && "px-4",
                    value === "grossMargin" && "px-7",
                    value === "profit" && "px-0" // override
                  )}
                >
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {/* Mobile: select dropdown */}
            <Select value={current} onValueChange={handleChange}>
              <SelectTrigger
                size="sm"
                className="w-40 @[767px]/card:hidden **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
                aria-label="Välj KPI"
              >
                <SelectValue placeholder="Välj KPI" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>
    </Card>
  );
}
