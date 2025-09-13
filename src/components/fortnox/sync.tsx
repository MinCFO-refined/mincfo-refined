"use client";
import { Link } from "lucide-react";
import { Button } from "../ui/button";

export default function SyncFortnoxButton() {
  function connect() {
    const redirectUri = `${window.location.origin}/api/fortnox/callback`;
    const scope = "companyinformation bookkeeping";
    const state = Math.random().toString(36).substring(2, 15);
    document.cookie = `fortnox-oauth_state=${state}; path=/; SameSite=Lax`;
    const authUrl =
      `https://apps.fortnox.se/oauth-v1/auth?` +
      `client_id=${process.env.NEXT_PUBLIC_FORTNOX_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scope}&` +
      `state=${state}&` +
      `response_type=code&` +
      `access_type=offline`;

    window.location.href = authUrl;
  }
  return (
    <Button className="flex gap-3 text-base" onClick={connect}>
      <Link />
      Anslut till Fortnox
    </Button>
  );
}
