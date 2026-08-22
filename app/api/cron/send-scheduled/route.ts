import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendGmailEmail } from "@/lib/gmail/send";
import { refreshAccessToken, isTokenExpired } from "@/lib/gmail/tokens";

/**
 * Vercel Cron Job endpoint — fires every 5 minutes (configured in vercel.json).
 * Finds all scheduled emails whose send time has passed and dispatches them.
 */
export async function GET(request: Request) {
  // Secure the cron endpoint — Vercel passes this header automatically
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();

  // Fetch all emails that are scheduled and past due
  const { data: dueEmails, error } = await supabase
    .from("sent_emails")
    .select("*, email_accounts!inner(*)")
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString());

  if (error) {
    console.error("[cron/send-scheduled] DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!dueEmails?.length) {
    return NextResponse.json({ sent: 0, message: "No scheduled emails due" });
  }

  let sent = 0;
  let failed = 0;

  for (const email of dueEmails) {
    try {
      // Get the user's email account
      const { data: account } = await supabase
        .from("email_accounts")
        .select("*")
        .eq("user_id", email.user_id)
        .eq("is_connected", true)
        .single();

      if (!account) {
        await supabase.from("sent_emails").update({ status: "failed" }).eq("id", email.id);
        failed++;
        continue;
      }

      let accessToken = account.access_token_plain as string | undefined;

      if (!accessToken || isTokenExpired(account.token_expires_at)) {
        if (!account.refresh_token_plain) {
          await supabase.from("sent_emails").update({ status: "failed" }).eq("id", email.id);
          failed++;
          continue;
        }
        const refreshed = await refreshAccessToken(account.refresh_token_plain as string);
        accessToken = refreshed.access_token;
        const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
        await supabase
          .from("email_accounts")
          .update({ access_token_plain: accessToken, token_expires_at: expiresAt })
          .eq("id", account.id);
      }

      const { messageId } = await sendGmailEmail({
        accessToken: accessToken!,
        to: email.to_email,
        toName: email.to_name,
        subject: email.subject,
        bodyText: email.body_text,
        bodyHtml: email.body_html,
      });

      await supabase
        .from("sent_emails")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          gmail_message_id: messageId,
        })
        .eq("id", email.id);

      sent++;
    } catch (e) {
      console.error(`[cron] Failed to send email ${email.id}:`, e);
      await supabase.from("sent_emails").update({ status: "failed" }).eq("id", email.id);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: dueEmails.length });
}
