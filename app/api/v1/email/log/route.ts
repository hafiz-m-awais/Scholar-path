import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { to_email, to_name, subject, body_text, sent_at, application_id, supervisor_id } = body;

  if (!to_email || !subject || !body_text) {
    return NextResponse.json({ error: "to_email, subject, and body_text are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sent_emails")
    .insert({
      user_id: user.id,
      application_id: application_id ?? null,
      supervisor_id: supervisor_id ?? null,
      direction: "received",
      to_email,
      to_name: to_name ?? null,
      subject,
      body_text,
      sent_at: sent_at ? new Date(sent_at).toISOString() : new Date().toISOString(),
      attachments: [],
      follow_up_done: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (supervisor_id) {
    await supabase
      .from("supervisors")
      .update({
        contact_status: "replied",
        last_contacted_at: new Date().toISOString().split("T")[0],
      })
      .eq("id", supervisor_id)
      .eq("user_id", user.id);

    await supabase.from("supervisor_communications").insert({
      user_id: user.id,
      supervisor_id,
      application_id: application_id ?? null,
      type: "reply_received",
      date: (sent_at ? new Date(sent_at) : new Date()).toISOString().split("T")[0],
      subject,
      summary: body_text.substring(0, 200),
    });
  }

  return NextResponse.json({ data }, { status: 201 });
}
