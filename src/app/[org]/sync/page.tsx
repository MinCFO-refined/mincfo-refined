import { syncFortnox } from "@/lib/fortnox/sync-data";
import { createClient, getUser, User } from "@/lib/supabase/server";

export default async function InitialSync() {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;

  const { data: integration, error } = await supabase
    .from("fortnox_integrations")
    .select("id, last_synced_at, has_synced")
    .eq("is_active", true)
    .eq("user_id", user.id)
    .single();

  if (error || !integration) {
    return (
      <main className="h-[100dvh] flex items-center justify-center text-xl font-semibold">
        <h1>No active Fortnox integration</h1>
      </main>
    );
  }

  if (integration.has_synced && integration.last_synced_at) {
    return (
      <main className="h-[100dvh] flex items-center justify-center text-xl font-semibold">
        <h1>
          Already synced on{" "}
          {new Date(integration.last_synced_at).toLocaleString()}
        </h1>
      </main>
    );
  }
  const result = await syncFortnox(user as User);
  return (
    <main className="h-[100dvh] flex items-center justify-center text-xl font-semibold">
      {result ? (
        <h1>
          Sync complete: {result.counts?.vouchers} vouchers,{" "}
          {result.counts?.transactions} transactions
        </h1>
      ) : (
        <h1>Sync failed</h1>
      )}
    </main>
  );
}
