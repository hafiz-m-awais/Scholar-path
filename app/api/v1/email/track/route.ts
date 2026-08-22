import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// 1x1 transparent GIF pixel (base64)
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get("id");

  if (trackingId) {
    try {
      const supabase = await getSupabaseServerClient();
      // Mark as read — only update the first time (read_at IS NULL)
      await supabase
        .from("sent_emails")
        .update({ read_at: new Date().toISOString() })
        .eq("tracking_id", trackingId)
        .is("read_at", null);
    } catch {
      // Silently fail — never break email loading over a tracking error
    }
  }

  // Always return the transparent pixel
  return new NextResponse(TRACKING_PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
