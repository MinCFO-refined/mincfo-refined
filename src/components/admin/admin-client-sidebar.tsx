"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconSearch,
  IconSettings,
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
import { UserWithProfileAndCompanies } from "@/lib/supabase/server";
import { Company } from "@/types/fortnox";
import Image from "next/image";
import { Link, UserPlus } from "lucide-react";
import { TeamSwitcher } from "../team-switcher";
import { isAdmin } from "@/lib/utils";

const data = {
  navMain: [
    {
      title: "Lägg till kund",
      url: "/admin/add-customer",
      icon: UserPlus,
      adminView: true,
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
  documents: [
    // {
    //   name: "Data Library",
    //   url: "#",
    //   icon: IconDatabase,
    // },
    // {
    //   name: "Reports",
    //   url: "#",
    //   icon: IconReport,
    // },
    // {
    //   name: "Word Assistant",
    //   url: "#",
    //   icon: IconFileWord,
    // },
  ],
};
export interface AppSidebarClientProps
  extends React.ComponentProps<typeof Sidebar> {
  user: UserWithProfileAndCompanies;
  companies: Company[];
}
export function AdminSidebarClient({
  companies,
  user,
  ...props
}: AppSidebarClientProps) {
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
        <TeamSwitcher companies={companies} />
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
