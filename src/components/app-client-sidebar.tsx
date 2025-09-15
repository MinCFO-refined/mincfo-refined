"use client";

import * as React from "react";
import {
  IconChartBar,
  IconChartPie,
  IconDashboard,
  IconHelp,
  IconReceipt2,
  IconSearch,
  IconSettings,
  IconWallet,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "@/lib/supabase/server";

import Image from "next/image";
import { FileBarChart, Link, TrendingUp } from "lucide-react";
import { slugify } from "@/lib/utils";

export interface AppSidebarClientProps
  extends React.ComponentProps<typeof Sidebar> {
  user: User;
}
export function AppSidebarClient({ user, ...props }: AppSidebarClientProps) {
  const companySlug = `${slugify(user.company.name)}`;
  const data = {
    navMain: [
      {
        title: "Översikt",
        url: `/${companySlug}/portal/dashboard`,
        icon: IconDashboard,
      },
      {
        title: "Omsättning",
        url: `/${companySlug}/portal/revenue`,
        icon: TrendingUp,
        children: [
          { title: "Per månad", url: "/org/portal/revenue/monthly" },
          { title: "Per år", url: "/org/portal/revenue/yearly" },
          { title: "Kunder", url: "/org/portal/revenue/customers" },
        ],
      },
      {
        title: "Vinst",
        url: `/${companySlug}/portal/profit`,
        icon: IconWallet,
        children: [
          { title: "Bruttovinst", url: "/org/portal/profit/gross" },
          { title: "Rörelsevinst", url: "/org/portal/profit/operating" },
          { title: "Nettoresultat", url: "/org/portal/profit/net" },
        ],
      },
      {
        title: "Kostnader",
        url: `/${companySlug}/portal/costs`,
        icon: IconReceipt2,
        children: [
          { title: "Personalkostnader", url: "/org/portal/costs/personnel" },
          { title: "Driftskostnader", url: "/org/portal/costs/operations" },
          { title: "Övriga kostnader", url: "/org/portal/costs/other" },
        ],
      },
      {
        title: "Bruttomarginal",
        url: `/${companySlug}/portal/gross-margin`,
        icon: IconChartPie,
        children: [
          { title: "Per produkt", url: "/org/portal/gross-margin/product" },
          { title: "Per kategori", url: "/org/portal/gross-margin/category" },
          { title: "Över tid", url: "/org/portal/gross-margin/timeline" },
        ],
      },
      {
        title: "Rapporter",
        url: `/${companySlug}/portal/reports`,
        icon: FileBarChart,
      },

      {
        title: "Analys",
        url: `/${companySlug}/portal/analysis`,
        icon: IconChartBar,
      },

      {
        title: "Fortnox",
        url: `/${companySlug}/portal/fortnox-integration`,
        icon: Link,
      },
    ],
    navClouds: [],
    navSecondary: [
      {
        title: "Inställningar",
        url: "#",
        icon: IconSettings,
      },
      {
        title: "Support",
        url: "#",
        icon: IconHelp,
      },
      {
        title: "Sök",
        url: "#",
        icon: IconSearch,
      },
    ],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex space-x-4 p-2">
              <Image
                src="https://framerusercontent.com/images/wA1VuWB2hJTmPECUOk81HM535U.svg"
                alt="Logo"
                height={24}
                width={24}
              />
              <h1 className="font-semibold text-base">Portal</h1>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} user={user} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
