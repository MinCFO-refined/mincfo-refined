import type { TablesInsert } from "@/types/supabase";
import { createClient, getUser, User } from "../supabase/server";
import Bottleneck from "bottleneck";

// ----------------- Typed aliases from your generated types -----------------
type VoucherInsert = TablesInsert<"fortnox_vouchers">;
type TransactionInsert = TablesInsert<"fortnox_voucher_transactions">;

// Minimal Fortnox types we actually use

type FortnoxVoucherHeader = {
  VoucherSeries: string;
  VoucherNumber: number;
  Year: number;
};

type FortnoxVoucherDetail = {
  Voucher: {
    VoucherSeries: string;
    VoucherNumber: number;
    Year: number;
    TransactionDate: string;
    Description?: string | null;
    Comments?: string | null;
    ApprovalState?: number | null;
    CostCenter?: string | null;
    Project?: string | null;
    ReferenceNumber?: string | null;
    ReferenceType?: string | null;
    VoucherRows?: Array<{
      Account: number;
      Debit?: number | null;
      Credit?: number | null;
      Description?: string | null;
      TransactionInformation?: string | null;
      Quantity?: number | null;
      CostCenter?: string | null;
      Project?: string | null;
      Removed?: boolean | null;
    }>;
  };
};

async function getValidTokens() {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;
  const { data: integration, error } = await supabase
    .from("fortnox_integrations")
    .select("*")
    .eq("is_active", true)
    .eq("user_id", user.id)
    .single();

  if (error || !integration) {
    console.error("No active Fortnox integration:", error?.message);
    return null;
  }

  let { access_token, refresh_token } = integration;
  const { id: integrationId } = integration;
  const { expires_at } = integration;

  // Refresh if needed
  if (expires_at && new Date(expires_at) < new Date()) {
    const basic = Buffer.from(
      `${process.env.FORTNOX_CLIENT_ID}:${process.env.FORTNOX_CLIENT_SECRET}`
    ).toString("base64");

    const refreshRes = await fetch("https://apps.fortnox.se/oauth-v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`, // 👈 credentials go here
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token ?? "",
      }),
    });

    if (!refreshRes.ok) {
      console.error(
        "Fortnox refresh failed:",
        refreshRes.status,
        await refreshRes.text()
      );
      return null;
    }

    const newTokens = await refreshRes.json();
    access_token = newTokens.access_token;
    refresh_token = newTokens.refresh_token ?? refresh_token;

    const newExpiresAt = new Date(
      Date.now() + newTokens.expires_in * 1000
    ).toISOString();

    const { error: updateError } = await supabase
      .from("fortnox_integrations")
      .update({
        access_token,
        refresh_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", integrationId);

    if (updateError) {
      console.error("Failed to update refreshed tokens:", updateError.message);
      return null;
    }
  }

  return { supabase, access_token, integrationId };
}
// --- Rate limiting setup ---
// Fortnox: 25 req / 5s AND 300 / minute (sliding window)
// To respect sliding window and prevent bursts, add minTime spacing
const limiter5s = new Bottleneck({
  reservoir: 25,
  reservoirRefreshAmount: 25,
  reservoirRefreshInterval: 5000,
  minTime: 250, // 5000ms / 25 = 200ms minimum between requests
  maxConcurrent: 1, // Limit concurrency to ensure spacing
});
const limiter1m = new Bottleneck({
  reservoir: 300,
  reservoirRefreshAmount: 300,
  reservoirRefreshInterval: 60_000,
  maxConcurrent: 10,
});
limiter5s.chain(limiter1m);

async function limitedFetch<T>(
  url: string,
  headers: Record<string, string>
): Promise<T> {
  return limiter5s.schedule(async () => {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Fortnox error ${res.status}: ${await res.text()}`);
    }
    return (await res.json()) as T;
  });
}
export async function syncFortnox(user: User) {
  const supabase = await createClient();

  // Hämta integration tokens
  const { data: integration } = await supabase
    .from("fortnox_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!integration) {
    console.error("Ingen Fortnox-integration hittades");
    return null;
  }

  const { access_token, id: integrationId } = integration;

  // Hämta company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!company || companyError) {
    console.error("Misslyckades att hämta company:", companyError);
    return null;
  }

  const headers = {
    Authorization: `Bearer ${access_token}`,
    Accept: "application/json",
  };

  // 1) Hämta alla voucher headers
  const voucherHeaders = await fetchAll<FortnoxVoucherHeader>(
    "https://api.fortnox.se/3/vouchers",
    "Vouchers",
    headers
  );

  console.log(`📑 Hittade ${voucherHeaders.length} vouchers (headers)`);

  // 2) Hämta detaljer per voucher med rate limiting & progress (fetching all)
  const details: FortnoxVoucherDetail[] = [];
  let processed = 0;
  for (const v of voucherHeaders) {
    const detail = await limitedFetch<FortnoxVoucherDetail>(
      `https://api.fortnox.se/3/vouchers/${encodeURIComponent(
        v.VoucherSeries
      )}/${encodeURIComponent(
        v.VoucherNumber
      )}?financialyear=${encodeURIComponent(v.Year)}`,
      headers
    );
    details.push(detail);
    processed++;
    console.log(`Fetched detail ${processed}/${voucherHeaders.length}`);
  }

  // 3) Bygg vouchers + transactions
  const vouchers: VoucherInsert[] = [];
  const transactions: TransactionInsert[] = [];

  details.forEach((detail) => {
    const voucher = detail.Voucher;
    const voucherId = `${voucher.VoucherSeries}-${voucher.Year}-${voucher.VoucherNumber}`;

    vouchers.push({
      voucher_id: voucherId,
      company_id: company.id,
      voucher_series: voucher.VoucherSeries,
      voucher_number: voucher.VoucherNumber,
      year: voucher.Year,
      transaction_date: voucher.TransactionDate,
      description: voucher.Description ?? null,
      comments: voucher.Comments ?? null,
      approval_state: voucher.ApprovalState ?? null,
      cost_center: voucher.CostCenter ?? null,
      project: voucher.Project ?? null,
      reference_number: voucher.ReferenceNumber ?? null,
      reference_type: voucher.ReferenceType ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (voucher.VoucherRows?.length) {
      voucher.VoucherRows.forEach(
        (
          t: NonNullable<
            FortnoxVoucherDetail["Voucher"]["VoucherRows"]
          >[number],
          idx: number
        ) => {
          transactions.push({
            id: `${voucherId}-${idx + 1}`,
            voucher_id: voucherId,
            account: t.Account,
            debit: t.Debit ?? null,
            credit: t.Credit ?? null,
            description: t.Description ?? null,
            transaction_information: t.TransactionInformation ?? null,
            quantity: t.Quantity ?? null,
            cost_center: t.CostCenter ?? null,
            project: t.Project ?? null,
            removed: t.Removed ?? null,
            created_at: new Date().toISOString(),
          });
        }
      );
    }
  });

  console.log(
    `🔄 Förbereder upsert: ${vouchers.length} vouchers, ${transactions.length} transactions`
  );

  // 4) Spara i Supabase
  if (vouchers.length) {
    const { error } = await supabase
      .from("fortnox_vouchers")
      .upsert(vouchers, { onConflict: "voucher_id" });
    if (error) console.error("❌ Upsert vouchers error:", error.message);
  }

  if (transactions.length) {
    const { error } = await supabase
      .from("fortnox_voucher_transactions")
      .upsert(transactions, { onConflict: "id" });
    if (error) console.error("❌ Upsert transactions error:", error.message);
  }

  // 5) Mark integration synced
  const { error: intErr } = await supabase
    .from("fortnox_integrations")
    .update({
      has_synced: true,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", integrationId);

  if (intErr) console.error("❌ Update integration error:", intErr.message);

  console.log(
    `🎉 Sync klar! Company: ${company.name}, Vouchers: ${vouchers.length}, Transactions: ${transactions.length}`
  );

  return {
    company: { id: company.id, name: company.name },
    counts: { vouchers: vouchers.length, transactions: transactions.length },
  };
}

// ----------------- Helper för paginering -----------------
async function fetchAll<T>(
  endpoint: string,
  key: string,
  headers: Record<string, string>
): Promise<T[]> {
  let page = 1;
  let totalPages = 1;
  const all: T[] = [];

  while (page <= totalPages) {
    const res = await limitedFetch<{
      [k: string]: unknown;
      MetaInformation?: { "@TotalPages"?: number };
    }>(`${endpoint}?limit=100&page=${page}`, headers);

    const chunk = (res[key] as T[]) ?? [];
    all.push(...chunk);

    totalPages = res.MetaInformation?.["@TotalPages"] ?? 1;
    page++;
  }

  return all;
}
