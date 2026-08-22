import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getGmailAuthUrl } from "@/lib/gmail/oauth";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = getGmailAuthUrl();
  return NextResponse.json({ url });
}
