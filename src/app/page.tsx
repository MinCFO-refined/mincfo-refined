import { getUser } from "@/lib/supabase/server";
import { isAdmin, slugify } from "@/lib/utils";

import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if ("profile" in user && isAdmin(user.profile ?? null)) {
    redirect("/admin/dashboard");
  }

  redirect(
    `/${
      ("company" in user && slugify(user.company.name)) || "organisation"
    }/portal/dashboard`
  );
}
