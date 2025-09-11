"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return <SidebarProvider defaultOpen={!isMobile}>{children}</SidebarProvider>;
}
