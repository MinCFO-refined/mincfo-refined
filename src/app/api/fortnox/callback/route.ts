import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface FortnoxTokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
  error?: string;
  error_description?: string;
}
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const queryState = req.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const stateFromCookie = cookieStore.get("fortnox-oauth_state")?.value;

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }
  if (!queryState || queryState !== stateFromCookie) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/fortnox/callback`;
  const clientId = process.env.NEXT_PUBLIC_FORTNOX_CLIENT_ID!;
  const clientSecret = process.env.FORTNOX_CLIENT_SECRET!;

  // Fortnox kräver Basic {base64(clientId:clientSecret)}
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://apps.fortnox.se/oauth-v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      // Måste vara identisk med redirect_uri du använde i steg 1
      // om du skickade den där, vilket du gör.
      redirect_uri: redirectUri,
    }),
  });

  const text = await res.text();
  let token: FortnoxTokenResponse;
  try {
    token = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from Fortnox", raw: text },
      { status: 500 }
    );
  }
  if (!res.ok || token.error) {
    return NextResponse.json(token ?? { error: "token_error", raw: text }, {
      status: 400,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No user session" }, { status: 401 });

  const { data: existing } = await supabase
    .from("fortnox_integrations")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("fortnox_integrations").upsert(
    {
      user_id: user.id,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      scope: token.scope,
      expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/org/portal/dashboard`
    );
  } else {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/org/sync`);
  }
}
