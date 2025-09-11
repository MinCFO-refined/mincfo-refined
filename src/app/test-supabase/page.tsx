"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function TestSupabase() {
  const [status, setStatus] = useState("Testing...");
  const supabase = createClient();

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...");
        console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log(
          "Key (first 20):",
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20)
        );

        // Test basic connection
        const { data, error } = await supabase
          .from("_realtime")
          .select("*")
          .limit(1);

        if (error) {
          console.error("Supabase error:", error);
          setStatus(`Error: ${error.message}`);
        } else {
          console.log("Supabase connected successfully");
          setStatus("Connection successful!");
        }
      } catch (err) {
        console.error("Connection test failed:", err);
        setStatus(`Connection failed: ${err}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h1>Supabase Connection Test</h1>
      <p>Status: {status}</p>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <p>
        Key:{" "}
        {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20)}...
      </p>
    </div>
  );
}
