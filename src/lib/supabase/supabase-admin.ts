// supabase-admin.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
