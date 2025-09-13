import { Company } from "@/types/fortnox";
import { AppSidebarClient } from "./app-client-sidebar";
import { User } from "@/lib/supabase/server";

interface AppSidebarProps
  extends React.ComponentProps<typeof AppSidebarClient> {
  user: User;
  company: Company;
}
export async function AppSidebar({ company, user, ...props }: AppSidebarProps) {
  return (
    <AppSidebarClient
      user={user}
      company={company}
      variant="inset"
      {...props}
    />
  );
}
