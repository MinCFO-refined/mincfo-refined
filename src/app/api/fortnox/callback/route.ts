import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
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
  let tokens: any;
  try {
    tokens = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from Fortnox", raw: text },
      { status: 500 }
    );
  }
  if (!res.ok || tokens.error) {
    return NextResponse.json(tokens ?? { error: "token_error", raw: text }, {
      status: 400,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No user session" }, { status: 401 });

  const { error } = await supabase.from("fortnox_integrations").insert({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    scope: tokens.scope,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    is_active: true,
    user_id: user.id,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/integrations/fortnox`
  );
}
