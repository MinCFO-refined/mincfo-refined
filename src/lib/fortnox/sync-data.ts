import type { TablesInsert } from "@/types/supabase";
import { createClient, User } from "../supabase/server";

// ----------------- Typed aliases from your generated types -----------------
type VoucherInsert = TablesInsert<"fortnox_vouchers">;
type TransactionInsert = TablesInsert<"fortnox_voucher_transactions">;
type CompanyInsert = TablesInsert<"companies">;

// Minimal Fortnox types we actually use
type FortnoxCompanyInformation = {
  CompanyInformation: {
    CompanyName: string;
    OrganizationNumber?: string;
    DatabaseNumber?: number;
    Address?: string;
    City?: string;
    Phone?: string;
  };
};

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
    Transactions?: Array<{
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

// ----------------- Token handling -----------------
async function getValidTokens() {
  const supabase = await createClient();

  const { data: integration, error } = await supabase
    .from("fortnox_integrations")
    .select("*")
    .eq("is_active", true)
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
    const refreshRes = await fetch("https://apps.fortnox.se/oauth-v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token ?? "",
        client_id: process.env.FORTNOX_CLIENT_ID!,
        client_secret: process.env.FORTNOX_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/fortnox/callback`,
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

// ----------------- Public: Single combined sync -----------------
export async function syncFortnox(user: User) {
  const tokens = await getValidTokens();
  if (!tokens) return null;
  const supabaseClient = await createClient();
  const { data: company, error: companyError } = await supabaseClient
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!company || companyError) {
    return console.error(companyError);
  }
  console.log("COMPANY:", company);
  return;
  const { supabase, access_token, integrationId } = tokens;

  const headers = {
    Authorization: `Bearer ${access_token}`,
    Accept: "application/json",
  };

  // 2) Vouchers (headers, paginated)
  const voucherHeaders = await fetchAll<FortnoxVoucherHeader>(
    "https://api.fortnox.se/3/vouchers",
    "Vouchers",
    headers
  );

  // 3) Expand to full vouchers & build rows
  const vouchers: VoucherInsert[] = [];
  const transactions: TransactionInsert[] = [];

  // TEMPORARY: Limit to 5 vouchers for testing
  const TEMP_LIMIT = 5;
  const limitedVouchers = voucherHeaders.slice(0, TEMP_LIMIT);

  console.log(
    `🔄 Processing ${limitedVouchers.length} vouchers (LIMITED FOR TESTING - original count: ${voucherHeaders.length})...`
  );
  let processedCount = 0;

  for (const v of limitedVouchers) {
    processedCount++;
    console.log(
      `📋 Processing voucher ${processedCount}/${limitedVouchers.length} (${v.VoucherSeries}-${v.VoucherNumber})`
    );
    try {
      const url = `https://api.fortnox.se/3/vouchers/${encodeURIComponent(
        v.VoucherSeries
      )}/${encodeURIComponent(
        v.VoucherNumber
      )}?financialyear=${encodeURIComponent(v.Year)}`;

      const detail = await safeFetch<FortnoxVoucherDetail>(url, { headers });

      const voucher = detail.Voucher;
      // deterministic ID avoids duplicates across runs
      const voucherId = `${voucher.VoucherSeries}-${voucher.Year}-${voucher.VoucherNumber}`;

      vouchers.push({
        voucher_id: voucherId,
        company_id: companyId,
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

      if (voucher.Transactions?.length) {
        voucher.Transactions.forEach((t, idx) => {
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
        });
      }
    } catch (err) {
      console.error(
        `❌ Voucher detail error (${processedCount}/${limitedVouchers.length}):`,
        v.VoucherSeries,
        v.VoucherNumber,
        err
      );
    }
  }

  console.log(
    `✅ Completed processing ${processedCount}/${limitedVouchers.length} vouchers (LIMITED TEST)`
  );

  // 4) Persist to Supabase (upsert by id to avoid dupes)
  if (vouchers.length) {
    const { error } = await supabase
      .from("fortnox_vouchers")
      .upsert(vouchers, { onConflict: "id" });
    if (error) console.error("Upsert vouchers error:", error.message);
  }

  if (transactions.length) {
    const { error } = await supabase
      .from("fortnox_voucher_transactions")
      .upsert(transactions, { onConflict: "id" });
    if (error) console.error("Upsert transactions error:", error.message);
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
  if (intErr)
    console.error("Update integration sync flags error:", intErr.message);

  console.log(
    `🎉 Sync completed! Company: ${companyName}, Vouchers: ${vouchers.length}, Transactions: ${transactions.length}`
  );

  return {
    company: { id: companyId, name: companyName },
    counts: { vouchers: vouchers.length, transactions: transactions.length },
  };
}

// ----------------- Helpers (typed) -----------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// simple global rate limiter (~2.5 rps)
let nextSlot = Date.now();
const SPACING_MS = 400;

async function schedule() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = (wait ? nextSlot : now) + SPACING_MS;
  if (wait) await sleep(wait);
}

async function safeFetch<T>(
  url: string,
  options: RequestInit,
  maxRetries = 5
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await schedule();

    const res = await fetch(url, options);
    if (res.ok) return (await res.json()) as T;

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : 5000 * attempt + Math.floor(Math.random() * 500);
      console.warn(
        `429 Too Many Requests, retrying in ${waitMs}ms (attempt ${attempt})`
      );
      await sleep(waitMs);
      continue;
    }

    if (res.status >= 500 && res.status < 600) {
      const waitMs = 1000 * attempt;
      console.warn(
        `${res.status} error, retrying in ${waitMs}ms (attempt ${attempt})`
      );
      await sleep(waitMs);
      continue;
    }

    throw new Error(`${res.status} ${await res.text()}`);
  }
  throw new Error(`Failed after ${maxRetries} retries: ${url}`);
}

async function fetchAll<T>(
  endpoint: string,
  key: string,
  headers: Record<string, string>
): Promise<T[]> {
  let page = 1;
  let totalPages = 1;
  const all: T[] = [];

  while (page <= totalPages) {
    const data = await safeFetch<{
      [k: string]: unknown;
      MetaInformation?: {
        "@TotalPages"?: number;
      };
    }>(`${endpoint}?limit=100&page=${page}`, { headers });
    const chunk = (data[key] as T[]) ?? [];
    all.push(...chunk);
    totalPages = data.MetaInformation?.["@TotalPages"] ?? 1;
    page++;
  }

  return all;
}
