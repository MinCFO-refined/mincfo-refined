import { Sidebar } from "@/components/ui/sidebar";

import { AppSidebarClient } from "./app-client-sidebar";
import { getUser } from "@/lib/supabase/server";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = await getUser();
  if (!user) return null;
  return (
    <Sidebar variant="inset" {...props} className="border-r">
      <AppSidebarClient user={user} />
    </Sidebar>
  );
}
