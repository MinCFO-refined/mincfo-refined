import { SidebarTrigger } from "@/components/ui/sidebar";
import { getUser } from "@/lib/supabase/server";
import AdminNav from "./admin-nav";
import SyncFortnox from "@/components/fortnox/sync";

export default async function Nav() {
  const user = await getUser();
  if (!user) return null;
  return (
    <nav className="p-4 flex justify-between bg-background border-b border-border">
      <SidebarTrigger className="text-primary" />
      {user.profile?.is_admin ? <AdminNav /> : <SyncFortnox />}
    </nav>
  );
}
