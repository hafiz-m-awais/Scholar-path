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

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const { data: signedUrlData, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.file_path, 60); // 60 second expiry

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { url: signedUrlData.signedUrl } });
}
