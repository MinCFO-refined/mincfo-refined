"use client";

import { Button } from "@/components/ui/button";
import { syncFortnox } from "@/lib/fortnox/sync-data";
import { User } from "@/lib/supabase/server";

export default function SyncButton({ user }: { user: User }) {
  return <Button onClick={() => syncFortnox(user as User)}>Sync</Button>;
}
