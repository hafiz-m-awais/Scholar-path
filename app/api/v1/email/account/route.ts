import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("email_accounts")
    .select("id, email_address, is_connected, connected_at, last_used_at, scopes")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ data: data ?? null });
}
