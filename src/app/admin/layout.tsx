import { AdminSidebar } from "@/components/admin/admin-sidebar";

import { SidebarWrapper } from "@/components/sidebar-wrapper";
import Nav from "@/layout/nav";
import { Admin, getUser } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/utils";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user || !isAdmin(user.profile || null)) return null;
  return (
    <SidebarWrapper>
      <AdminSidebar user={user} companies={(user as Admin).companies || []} />

      <div className="flex w-screen flex-col">
        <header>
          <Nav />
        </header>
        <div className="p-2 pt-0">
          <main className="bg-background flex-1 h-screen p-6">{children}</main>
        </div>
      </div>
    </SidebarWrapper>
  );
}
