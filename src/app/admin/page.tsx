import { getUser } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");
  if (isAdmin(user.profile ?? null)) {
    redirect("/admin/dashboard");
  } else {
    redirect("/org/portal/dashboard");
  }
}
