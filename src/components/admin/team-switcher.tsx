"use client";

import { ChevronsUpDown, Loader2, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Company } from "@/types/fortnox";
import { safeFormatOrgNumber } from "@/lib/utils";

export function TeamSwitcher({
  companies,
  activeCompany,
  onCompanyChange,
  loading,
}: {
  companies?: Company[];
  activeCompany: Company | null;
  onCompanyChange: (company: Company) => void;
  loading: boolean;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <span className="truncate font-medium">
                      {activeCompany?.name || "Välj företag"}
                    </span>
                    <span className="truncate text-xs">
                      {activeCompany?.organisation_number ||
                        "Organisationsnummer"}
                    </span>
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Kunder
            </DropdownMenuLabel>
            {companies?.map((company, i) => (
              <DropdownMenuItem
                key={company.name || i}
                onClick={() => onCompanyChange(company)}
                className="gap-2 p-2"
              >
                <div className="flex flex-col justify-center">
                  <span> {company.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {safeFormatOrgNumber(company?.organisation_number)}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Lägg till kund
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
