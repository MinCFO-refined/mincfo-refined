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

  const userIsAdmin = isAdmin(user.profile || null);

  return (
    <SidebarWrapper>
      {userIsAdmin ? (
        <AdminSidebar
          user={user as Admin}
          companies={(user as Admin).companies || []}
        />
      ) : (
        <AppSidebar user={user as User} company={(user as User).company} />
      )}

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
