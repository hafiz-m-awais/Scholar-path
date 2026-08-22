import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const version_label = (formData.get("version_label") as string) ?? "v1";
  const notes = formData.get("notes") as string | null;
  const application_id = formData.get("application_id") as string | null;

  if (!file || !name || !type) {
    return NextResponse.json({ error: "file, name, and type are required" }, { status: 400 });
  }

  // Validate file type
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed. Use PDF, DOCX, JPEG, or PNG." }, { status: 400 });
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size exceeds 10MB limit." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const uuid = crypto.randomUUID();
  const filePath = `${user.id}/${type}/${uuid}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      name,
      type,
      version_label,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      notes: notes ?? null,
      is_active: false,
      parent_document_id: (formData.get("parent_document_id") as string | null) ?? null,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from("documents").remove([filePath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (application_id) {
    await supabase.from("application_documents").insert({
      application_id,
      document_id: data.id,
      document_type: type,
      status: "attached",
    });
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
