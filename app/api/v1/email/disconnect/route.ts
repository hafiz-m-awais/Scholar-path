import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("email_accounts")
    .update({ is_connected: false, access_token_plain: null, refresh_token_plain: null })
    .eq("user_id", user.id);

  return NextResponse.json({ data: null });
}
