import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  // Prevent manipulation of ownership/file fields via this endpoint
  delete body.id;
  delete body.user_id;
  delete body.file_path;
  delete body.file_name;
  delete body.file_size;
  delete body.mime_type;

  if (body.is_active === true) {
    const { data: current } = await supabase
      .from("documents")
      .select("type")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (current) {
      await supabase
        .from("documents")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("type", current.type)
        .neq("id", id);
    }
  }

  const { data, error } = await supabase
    .from("documents")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Best-effort storage cleanup; row is already deleted so we don't fail the request on this.
  await supabase.storage.from("documents").remove([doc.file_path]);

  return NextResponse.json({ data: null }, { status: 200 });
}
