import { AdminSidebarClient } from "./admin-client-sidebar";
import { Admin } from "@/lib/supabase/server";

interface AppSidebarProps
  extends React.ComponentProps<typeof AdminSidebarClient> {
  user: Admin;
}
export async function AdminSidebar({ user, ...props }: AppSidebarProps) {
  return <AdminSidebarClient user={user} variant="inset" {...props} />;
}
