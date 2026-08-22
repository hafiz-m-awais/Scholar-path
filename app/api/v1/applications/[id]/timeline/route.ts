import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, created_at, completed_at")
    .eq("application_id", id)
    .eq("user_id", user.id);

  // Fetch documents
  const { data: docs } = await supabase
    .from("documents")
    .select("id, name, type, created_at")
    .eq("application_id", id)
    .eq("user_id", user.id);

  // Fetch supervisor communications
  const { data: comms } = await supabase
    .from("supervisor_communications")
    .select("id, type, date, subject, created_at")
    .eq("application_id", id)
    .eq("user_id", user.id);

  const timeline = [];

  // Map tasks
  if (tasks) {
    for (const t of tasks) {
      timeline.push({
        id: `task_${t.id}_created`,
        type: "task_created",
        title: `Task created: ${t.title}`,
        date: t.created_at,
      });
      if (t.status === "completed" && t.completed_at) {
        timeline.push({
          id: `task_${t.id}_completed`,
          type: "task_completed",
          title: `Task completed: ${t.title}`,
          date: t.completed_at,
        });
      }
    }
  }

  // Map docs
  if (docs) {
    for (const d of docs) {
      timeline.push({
        id: `doc_${d.id}`,
        type: "document_uploaded",
        title: `Uploaded document: ${d.name} (${d.type.replace("_", " ")})`,
        date: d.created_at,
      });
    }
  }

  // Map comms
  if (comms) {
    for (const c of comms) {
      timeline.push({
        id: `comm_${c.id}`,
        type: "communication",
        title: `${c.type === "email_sent" ? "Email sent" : "Received reply"}: ${c.subject}`,
        date: c.created_at || new Date(c.date).toISOString(),
      });
    }
  }

  // Sort descending by date
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ data: timeline });
}
