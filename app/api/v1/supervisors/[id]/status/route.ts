import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contact_status, log_type } = await request.json();

  const { data, error } = await supabase
    .from("supervisors")
    .update({
      contact_status,
      last_contacted_at: new Date().toISOString().split("T")[0],
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log communication entry
  if (log_type) {
    await supabase.from("supervisor_communications").insert({
      user_id: user.id,
      supervisor_id: id,
      type: log_type,
      date: new Date().toISOString().split("T")[0],
      summary: `Status updated to: ${contact_status}`,
    });
  }

  return NextResponse.json({ data });
}
