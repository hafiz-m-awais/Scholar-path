import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("application_id");

  let query = supabase
    .from("deadlines")
    .select("*, application:applications(id, university_name, program_name)")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.application_id) {
    return NextResponse.json({ error: "application_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("deadlines")
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
