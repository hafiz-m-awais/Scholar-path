import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { addDays } from "date-fns";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];
  const in30 = addDays(new Date(), 30).toISOString().split("T")[0];
  const in7 = addDays(new Date(), 7).toISOString().split("T")[0];

  // Run queries in parallel
  const [
    applicationsRes,
    deadlinesRes,
    tasksRes,
    followUpsRes,
    missingDocsRes,
    supervisorsAwaitingRes,
    recentEmailsRes,
    recentSubmissionsRes,
    recentDocsRes,
  ] = await Promise.all([
    supabase.from("applications").select("status").eq("user_id", user.id),
    supabase
      .from("deadlines")
      .select("*, application:applications(id, university_name, program_name)")
      .gte("date", today)
      .lte("date", in30)
      .order("date", { ascending: true }),
    supabase
      .from("tasks")
      .select("*, application:applications(university_name)")
      .eq("user_id", user.id)
      .neq("status", "completed")
      .or(`due_date.lte.${in7},due_date.is.null`)
      .not("due_date", "is", null)
      .lte("due_date", today),
    supabase
      .from("sent_emails")
      .select("id, subject, to_name, to_email, supervisor_id, application_id, application:applications(university_name)")
      .eq("user_id", user.id)
      .lte("follow_up_date", today)
      .eq("follow_up_done", false),
    supabase
      .from("application_documents")
      .select("application_id")
      .eq("status", "missing")
      .eq("is_not_needed", false)
      .eq("is_required", true),
    supabase
      .from("supervisors")
      .select("id")
      .eq("user_id", user.id)
      .eq("contact_status", "awaiting_response"),
    supabase
      .from("sent_emails")
      .select("subject, to_name, to_email, sent_at")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(5),
    supabase
      .from("submission_logs")
      .select("sent_to_label, method, sent_at, application:applications(university_name)")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(3),
    supabase
      .from("documents")
      .select("name, type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  // Stats by status
  const stats: Record<string, number> = {};
  for (const app of applicationsRes.data ?? []) {
    stats[app.status] = (stats[app.status] ?? 0) + 1;
  }

  // Action required items
  const actionRequired = [
    ...(tasksRes.data ?? []).map((t) => ({
      type: "task",
      title: t.title,
      application_name: (t.application as { university_name: string } | null)?.university_name ?? "Unknown",
      application_id: t.application_id ?? "",
      due_date: t.due_date,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(followUpsRes.data ?? []).slice(0, 5).map((f: any) => ({
      type: "follow_up",
      title: `Follow up: ${f.to_name || f.to_email}`,
      application_name: f.application?.university_name ?? "",
      application_id: f.application_id ?? "",
      supervisor_id: f.supervisor_id ?? "",
      original_subject: f.subject,
    })),
  ];

  // Unique missing docs count (by application)
  const missingAppIds = new Set((missingDocsRes.data ?? []).map((d) => d.application_id));

  // Recent activity
  const recentActivity = [
    ...(recentEmailsRes.data ?? []).map((e) => ({
      type: "email_sent",
      description: `Email sent to ${e.to_name ?? e.to_email}: "${e.subject}"`,
      created_at: e.sent_at,
    })),
    ...(recentSubmissionsRes.data ?? []).map((s) => ({
      type: "submission_logged",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      description: `Submission logged: ${((s.application as any)?.university_name ?? "Unknown")} via ${s.method}`,
      created_at: s.sent_at,
    })),
    ...(recentDocsRes.data ?? []).map((d) => ({
      type: "document_uploaded",
      description: `Document uploaded: ${d.name}`,
      created_at: d.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return NextResponse.json({
    data: {
      stats,
      upcoming_deadlines: deadlinesRes.data ?? [],
      action_required: actionRequired,
      follow_up_summary: {
        due: followUpsRes.data?.length ?? 0,
        awaiting: supervisorsAwaitingRes.data?.length ?? 0,
        replied: 0, // calculated from supervisors with replied status
      },
      missing_docs_count: missingAppIds.size,
      recent_activity: recentActivity,
    },
  });
}
