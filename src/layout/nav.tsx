import { SidebarTrigger } from "@/components/ui/sidebar";
import { getUser } from "@/lib/supabase/server";
import AdminNav from "./admin-nav";
import SyncFortnox from "@/components/fortnox/sync";
import { Separator } from "@/components/ui/separator";

export default async function Nav() {
  const user = await getUser();
  if (!user) return null;
  return (
    <div className="bg-sidebar p-2 pb-0 max-md:p-0 ">
      <nav className="p-2.5 flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 bg-background border-b border-border rounded-t-xl max-md:rounded-none">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {/* {user.profile?.is_admin ? <AdminNav /> : <SyncFortnox />} */}
      </nav>
    </div>
  );
}
