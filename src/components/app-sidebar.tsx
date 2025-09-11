import { fetchCompanies } from "@/lib/fortnox";
import { AppSidebarClient } from "./app-client-sidebar";
import { getUser } from "@/lib/supabase/server";

export async function AppSidebar(
  props: Omit<
    React.ComponentProps<typeof AppSidebarClient>,
    "user" | "companies"
  >
) {
  const user = await getUser();
  if (!user) return null;
  const companies = user.profile?.is_admin ? await fetchCompanies() : undefined;
  return (
    <AppSidebarClient
      user={user}
      companies={companies}
      variant="inset"
      className="border-r"
      {...props}
    />
  );
}
