import { Company } from "@/types/fortnox";
import { AdminSidebarClient } from "./admin-client-sidebar";
import { UserWithProfileAndCompanies } from "@/lib/supabase/server";

interface AppSidebarProps
  extends React.ComponentProps<typeof AdminSidebarClient> {
  user: UserWithProfileAndCompanies;
  companies: Company[];
}
export async function AdminSidebar({
  companies,
  user,
  ...props
}: AppSidebarProps) {
  return (
    <AdminSidebarClient
      user={user}
      companies={companies}
      variant="inset"
      {...props}
    />
  );
}
