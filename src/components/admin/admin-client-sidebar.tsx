"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconChartBar,
  IconChartPie,
  IconDashboard,
  IconHelp,
  IconLayoutDashboard,
  IconReceipt2,
  IconSearch,
  IconSettings,
  IconWallet,
} from "@tabler/icons-react";

import { NavMain } from "./admin-nav-main";
import { NavSecondary } from "@/components/nav-secondary";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Admin } from "@/lib/supabase/server";

import Image from "next/image";

import { TeamSwitcher } from "./team-switcher";
import { FileBarChart, TrendingUp } from "lucide-react";
import { slugify } from "@/lib/utils";
import { Company } from "@/types/fortnox";
import { NavUser } from "./admin-nav-user";
import { useLocalStorage } from "@/hooks/useStorage";

export interface AppSidebarClientProps
  extends React.ComponentProps<typeof Sidebar> {
  user: Admin;
}
export function AdminSidebarClient({ user, ...props }: AppSidebarClientProps) {
  const { setItemL, getItemL } = useLocalStorage();
  const router = useRouter();
  const pathname = usePathname();
  const [companyLoading, setCompanyLoading] = useState(true);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  useEffect(() => {
    const stored = getItemL<Company | null>("activeCompany", null);
    setCompanyLoading(false);
    setActiveCompany(stored);
  }, [getItemL]);

  function handleCompanyChange(company: Company) {
    setActiveCompany(company);
    setItemL("activeCompany", company);
    const baseSlug = `${slugify(company.name)}-${company.organisation_number}`;

    const parts = pathname.split("/");

    // Case 1: already in a company route → swap slug
    if (
      parts.length >= 3 &&
      parts[1] === "admin" &&
      parts[2] !== "add-customer" &&
      parts[2] !== "dashboard"
    ) {
      parts[2] = baseSlug;
      router.push(parts.join("/"));
      return;
    }

    // Case 2: global admin/dashboard or other → send to company dashboard
    router.push(`/admin/${baseSlug}/dashboard`);
  }

  const companySlug = activeCompany
    ? `${slugify(activeCompany.name)}-${activeCompany.organisation_number}`
    : null;

  const data = {
    navMain: [
      {
        title: "Adminpanel",
        url: "/admin/dashboard",
        icon: IconLayoutDashboard,
      },
      ...(companySlug
        ? [
            {
              title: "Översikt",
              url: `/admin/${companySlug}/dashboard`,
              icon: IconDashboard,
              requiresCompany: true,
            },
            {
              title: "Omsättning",
              url: `/admin/${companySlug}/revenue`,
              icon: TrendingUp,
              requiresCompany: true,
              children: [
                { title: "Per månad", url: "/org/portal/revenue/monthly" },
                { title: "Per år", url: "/org/portal/revenue/yearly" },
                { title: "Kunder", url: "/org/portal/revenue/customers" },
              ],
            },
            {
              title: "Vinst",
              url: `/admin/${companySlug}/profit`,
              icon: IconWallet,
              requiresCompany: true,
              children: [
                { title: "Bruttovinst", url: "/org/portal/profit/gross" },
                { title: "Rörelsevinst", url: "/org/portal/profit/operating" },
                { title: "Nettoresultat", url: "/org/portal/profit/net" },
              ],
            },
            {
              title: "Kostnader",
              url: `/admin/${companySlug}/costs`,
              icon: IconReceipt2,
              requiresCompany: true,
              children: [
                {
                  title: "Personalkostnader",
                  url: "/org/portal/costs/personnel",
                },
                {
                  title: "Driftskostnader",
                  url: "/org/portal/costs/operations",
                },
                { title: "Övriga kostnader", url: "/org/portal/costs/other" },
              ],
            },
            {
              title: "Bruttomarginal",
              url: `/admin/${companySlug}/gross-margin`,
              icon: IconChartPie,
              requiresCompany: true,
              children: [
                {
                  title: "Per produkt",
                  url: "/org/portal/gross-margin/product",
                },
                {
                  title: "Per kategori",
                  url: "/org/portal/gross-margin/category",
                },
                { title: "Över tid", url: "/org/portal/gross-margin/timeline" },
              ],
            },
            {
              title: "Rapporter",
              url: `/admin/${companySlug}/reports`,
              icon: FileBarChart,
              requiresCompany: true,
            },

            {
              title: "Analys",
              url: "/org/portal/analysis",
              icon: IconChartBar,
              requiresCompany: true,
            },
          ]
        : []),
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
        <TeamSwitcher
          companies={user.companies}
          activeCompany={activeCompany}
          onCompanyChange={handleCompanyChange}
          loading={companyLoading}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          user={user}
          activeCompany={activeCompany}
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
