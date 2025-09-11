"use client";
import * as React from "react";
import { GalleryVerticalEnd, Settings2, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/nav-main";

import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { UserWithProfile } from "@/lib/supabase/server";
import { Company } from "@/types/fortnox";
import Image from "next/image";

// This is sample data.
const data = {
  teams: [
    {
      name: "Portal",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Ekonomi",
      url: "/ekonomi",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Översikt",
          url: "översikt",
        },
      ],
    },

    {
      title: "Settings",
      url: "/inställningar",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebarClient({
  user,
  companies,
  ...props
}: { user: UserWithProfile; companies?: Company[] } & React.ComponentProps<
  typeof Sidebar
>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader
        className={` ${
          user.profile?.is_admin ? "p-0" : ""
        } group-data-[collapsible=icon]:p-2 `}
      >
        {user.profile?.is_admin ? (
          <TeamSwitcher companies={companies} />
        ) : (
          <div className="p-1 mb-5 flex items-center space-x-4">
            <Image
              src="https://framerusercontent.com/images/wA1VuWB2hJTmPECUOk81HM535U.svg"
              alt="Logo"
              height={24}
              width={24}
            />
            <h1 className="font-semibold group-data-[collapsible=icon]:hidden">
              Portal
            </h1>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
