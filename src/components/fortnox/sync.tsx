"use client";
import { Link } from "lucide-react";
import { Button } from "../ui/button";

export default function SyncFortnox() {
  function connect() {
    const redirectUri = `${window.location.origin}/api/fortnox/callback`;
    const scope = "companyinformation bookkeeping";
    const state = Math.random().toString(36).substring(2, 15);

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
    <Button size="sm" className="flex gap-3" onClick={connect}>
      <Link />
      Koppla
    </Button>
  );
}
