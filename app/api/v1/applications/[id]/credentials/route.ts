import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Decrypt credentials server-side
  const { data, error } = await supabase.rpc("get_portal_credentials_decrypted", {
    p_application_id: id,
    p_user_id: user.id,
  });

  if (error) {
    // Fallback: return without encrypted fields if RPC not available
    const { data: plain, error: plainErr } = await supabase
      .from("portal_credentials")
      .select("id, application_id, user_id, portal_url, username, application_reference_id, security_question, notes, status, last_used_at, created_at, updated_at")
      .eq("application_id", id)
      .eq("user_id", user.id);
    if (plainErr) return NextResponse.json({ error: plainErr.message }, { status: 500 });
    return NextResponse.json({ data: plain });
  }
  return NextResponse.json({ data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const encKey = process.env.ENCRYPTION_KEY!;

  // Build insert with server-side encryption via SQL
  const { data, error } = await supabase.rpc("insert_portal_credential", {
    p_application_id: id,
    p_user_id: user.id,
    p_portal_url: body.portal_url ?? null,
    p_username: body.username ?? null,
    p_password: body.password ?? null,
    p_application_reference_id: body.application_reference_id ?? null,
    p_pin: body.pin ?? null,
    p_security_question: body.security_question ?? null,
    p_security_answer: body.security_answer ?? null,
    p_notes: body.notes ?? null,
    p_status: body.status ?? "not_created",
    p_enc_key: encKey,
  });

  if (error) {
    // Fallback: insert without encryption (plain text fields only)
    const { data: plain, error: plainErr } = await supabase
      .from("portal_credentials")
      .insert({
        application_id: id,
        user_id: user.id,
        portal_url: body.portal_url ?? null,
        username: body.username ?? null,
        application_reference_id: body.application_reference_id ?? null,
        security_question: body.security_question ?? null,
        notes: body.notes ?? null,
        status: body.status ?? "not_created",
      })
      .select()
      .single();
    if (plainErr) return NextResponse.json({ error: plainErr.message }, { status: 500 });
    return NextResponse.json({ data: plain }, { status: 201 });
  }
  return NextResponse.json({ data }, { status: 201 });
}
