import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.getAll("status");
  const country = searchParams.get("country");
  const funding_type = searchParams.get("funding_type");
  const priority = searchParams.get("priority");

  let query = supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status.length) query = query.in("status", status);
  if (country) query = query.eq("country", country);
  if (funding_type) query = query.eq("funding_type", funding_type);
  if (priority) query = query.eq("priority", priority);
  if (search) {
    query = query.or(
      `university_name.ilike.%${search}%,program_name.ilike.%${search}%,department.ilike.%${search}%`
    );
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
  const { data, error } = await supabase
    .from("applications")
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
