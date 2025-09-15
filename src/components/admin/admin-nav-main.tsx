"use client";

import { ChevronDown, UserPlus, type LucideIcon } from "lucide-react";
import { IconBuilding, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Admin } from "@/lib/supabase/server";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Company } from "@/types/fortnox";

export function NavMain({
  items,
  user,
  activeCompany,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon | LucideIcon;
    children?: { title: string; url: string }[];
    requiresCompany?: boolean;
  }[];
  user: Admin;
  activeCompany: Company | null;
}) {
  const pathname = usePathname();

  // Separate global vs company-dependent items
  const globalItems = items.filter((i) => !i.requiresCompany);
  const companyItems = items.filter((i) => i.requiresCompany);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Add customer button */}
        <SidebarMenu className="mb-4">
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton asChild>
              <Button
                variant="outline"
                className={`font-normal justify-start transition-all duration-100 active:text-foreground ${
                  pathname.startsWith("/admin/add-customer")
                    ? "!bg-primary text-background hover:text-background hover:!bg-primary/80 active:text-background "
                    : ""
                }`}
                asChild
              >
                <Link href="/admin/add-customer">
                  <UserPlus />
                  <span>Lägg till kund</span>
                </Link>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Always show global items */}
        <SidebarMenu>
          {globalItems.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`!cursor-pointer transition-all duration-100 ${
                    isActive
                      ? "bg-primary text-background hover:bg-primary/90 hover:text-background"
                      : "hover:bg-muted-foreground/10"
                  }`}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Collapsible for company items */}

        {companyItems.length > 0 && (
          <SidebarMenu className="flex flex-col gap-2">
            <SidebarMenuItem>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="group flex items-center justify-between !cursor-pointer transition-all duration-100 mb-1">
                    <div className="flex items-center gap-2">
                      <IconBuilding className="h-4 w-4 text-muted-foreground" />
                      <span>{activeCompany?.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 transition-transform group-data-[state=open]:rotate-0" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenu className="flex flex-col gap-1">
                    {companyItems.map((item) => {
                      const isActive = pathname === item.url;

                      if (item.children) {
                        return (
                          <SidebarMenuItem key={item.title}>
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                  tooltip={item.title}
                                  className="group flex items-center justify-between !cursor-pointer transition-all duration-100"
                                >
                                  <div className="flex items-center gap-2">
                                    {item.icon && (
                                      <item.icon className="h-4 w-4" />
                                    )}
                                    <span>{item.title}</span>
                                  </div>
                                  <ChevronDown className="h-4 w-4 -rotate-90 transition-transform group-data-[state=open]:rotate-0" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <SidebarMenuSub className="flex flex-col gap-2">
                                  {item.children.map((child) => {
                                    const isChildActive =
                                      pathname === child.url;
                                    return (
                                      <SidebarMenuSubItem key={child.title}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={isChildActive}
                                        >
                                          <Link href={child.url}>
                                            {child.title}
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    );
                                  })}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </Collapsible>
                          </SidebarMenuItem>
                        );
                      }

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            className={`!cursor-pointer transition-all duration-100 ${
                              isActive
                                ? "bg-primary text-background hover:bg-primary/90 hover:text-background"
                                : "hover:bg-muted-foreground/10"
                            }`}
                          >
                            <Link href={item.url}>
                              {item.icon && <item.icon className="h-4 w-4" />}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
