import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import Nav from "@/layout/nav";
import { getUser, Admin, User } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/utils";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) return null;

  const admin = isAdmin(user.profile || null);

  return (
    <SidebarWrapper>
      {admin ? (
        <AdminSidebar user={user as Admin} />
      ) : (
        <AppSidebar user={user as User} />
      )}

      <div className="flex w-screen flex-col">
        <header>
          <Nav />
        </header>
        <div className="px-2">
          <main className="bg-background flex-1 p-6 min-h-[95.5dvh]">
            {children}
          </main>
        </div>
      </div>
    </SidebarWrapper>
  );
}
