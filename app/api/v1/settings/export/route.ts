import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    applications,
    supervisors,
    communications,
    documents,
    tasks,
    deadlines,
    emails,
    submissions,
    templates,
  ] = await Promise.all([
    supabase.from("applications").select("*").eq("user_id", user.id),
    supabase.from("supervisors").select("*").eq("user_id", user.id),
    supabase.from("supervisor_communications").select("*").eq("user_id", user.id),
    supabase.from("documents").select("id, name, type, version_label, file_name, file_size, mime_type, notes, tags, is_active, created_at").eq("user_id", user.id),
    supabase.from("tasks").select("*").eq("user_id", user.id),
    supabase.from("deadlines").select("*").eq("user_id", user.id),
    supabase.from("sent_emails").select("id, to_email, to_name, subject, body_text, sent_at, follow_up_date, follow_up_done, template_used, application_id, supervisor_id").eq("user_id", user.id),
    supabase.from("submission_logs").select("*").eq("user_id", user.id),
    supabase.from("email_templates").select("*").eq("user_id", user.id),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    applications: applications.data ?? [],
    supervisors: supervisors.data ?? [],
    supervisor_communications: communications.data ?? [],
    documents_metadata: documents.data ?? [],
    tasks: tasks.data ?? [],
    deadlines: deadlines.data ?? [],
    sent_emails: emails.data ?? [],
    submission_logs: submissions.data ?? [],
    email_templates: templates.data ?? [],
  };

  // Return JSON export
  const json = JSON.stringify(exportData, null, 2);
  const filename = `phd-os-export-${new Date().toISOString().split("T")[0]}.json`;

  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
