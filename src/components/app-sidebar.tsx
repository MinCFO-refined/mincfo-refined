import { AppSidebarClient } from "./app-client-sidebar";
import { User } from "@/lib/supabase/server";

interface AppSidebarProps
  extends React.ComponentProps<typeof AppSidebarClient> {
  user: User;
}
export async function AppSidebar({ user, ...props }: AppSidebarProps) {
  return <AppSidebarClient user={user} variant="inset" {...props} />;
}
