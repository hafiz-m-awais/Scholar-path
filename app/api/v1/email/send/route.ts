import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendGmailEmail } from "@/lib/gmail/send";
import { refreshAccessToken, isTokenExpired } from "@/lib/gmail/tokens";

/** Injects a tracking pixel into HTML email body */
function injectTrackingPixel(html: string, trackingId: string, baseUrl: string): string {
  const pixel = `<img src="${baseUrl}/api/v1/email/track?id=${trackingId}" width="1" height="1" style="display:none" alt="" />`;
  if (html.includes("</body>")) return html.replace("</body>", `${pixel}</body>`);
  return html + pixel;
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    to_email, to_name, subject, body_text, body_html,
    application_id, supervisor_id, follow_up_date, template_used, scheduled_for,
  } = body;

  if (!to_email || !subject || !body_text) {
    return NextResponse.json({ error: "to_email, subject, and body_text are required" }, { status: 400 });
  }

  const trackingId = crypto.randomUUID();

  // If scheduled for future, save as scheduled and return early
  if (scheduled_for && new Date(scheduled_for) > new Date()) {
    const { data: logged } = await supabase
      .from("sent_emails")
      .insert({
        user_id: user.id,
        application_id: application_id ?? null,
        supervisor_id: supervisor_id ?? null,
        to_email, to_name: to_name ?? null, subject, body_text,
        body_html: body_html ?? null,
        attachments: [],
        sent_at: new Date().toISOString(),
        follow_up_date: follow_up_date ?? null,
        follow_up_done: false,
        template_used: template_used ?? null,
        tracking_id: trackingId,
        scheduled_for,
        status: "scheduled",
      })
      .select().single();

    return NextResponse.json({ data: logged, scheduled: true }, { status: 200 });
  }

  // Get connected email account
  const { data: account } = await supabase
    .from("email_accounts").select("*")
    .eq("user_id", user.id).eq("is_connected", true).single();

  if (!account) {
    return NextResponse.json({ error: "No Gmail account connected. Connect Gmail in Settings." }, { status: 400 });
  }

  let accessToken = account.access_token_plain as string | undefined;

  if (!accessToken || isTokenExpired(account.token_expires_at)) {
    if (!account.refresh_token_plain) {
      return NextResponse.json({ error: "Gmail token expired. Please reconnect Gmail." }, { status: 400 });
    }
    try {
      const refreshed = await refreshAccessToken(account.refresh_token_plain as string);
      accessToken = refreshed.access_token;
      const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
      await supabase.from("email_accounts")
        .update({ access_token_plain: accessToken, token_expires_at: expiresAt, last_used_at: new Date().toISOString() })
        .eq("id", account.id);
    } catch {
      return NextResponse.json({ error: "Failed to refresh Gmail token. Please reconnect Gmail." }, { status: 400 });
    }
  }

  try {
    const parsedAttachments = body.attachments?.map((att: { filename: string; content_base64: string; mimeType: string }) => ({
      filename: att.filename,
      content: Buffer.from(att.content_base64, "base64"),
      mimeType: att.mimeType,
    }));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${request.headers.get("host")}`;
    const trackedHtml = body_html ? injectTrackingPixel(body_html, trackingId, baseUrl) : undefined;

    const { messageId } = await sendGmailEmail({
      accessToken: accessToken!,
      to: to_email, toName: to_name, subject,
      bodyText: body_text, bodyHtml: trackedHtml,
      attachments: parsedAttachments,
    });

    const { data: logged } = await supabase.from("sent_emails").insert({
      user_id: user.id,
      application_id: application_id ?? null,
      supervisor_id: supervisor_id ?? null,
      to_email, to_name: to_name ?? null, subject, body_text,
      body_html: trackedHtml ?? null,
      attachments: [],
      sent_at: new Date().toISOString(),
      gmail_message_id: messageId,
      follow_up_date: follow_up_date ?? null,
      follow_up_done: false,
      template_used: template_used ?? null,
      tracking_id: trackingId,
      status: "sent",
    }).select().single();

    if (supervisor_id) {
      await supabase.from("supervisors")
        .update({ contact_status: "email_sent", last_contacted_at: new Date().toISOString().split("T")[0] })
        .eq("id", supervisor_id).eq("user_id", user.id);

      await supabase.from("supervisor_communications").insert({
        user_id: user.id, supervisor_id,
        application_id: application_id ?? null,
        type: "email_sent",
        date: new Date().toISOString().split("T")[0],
        subject,
        summary: body_text.substring(0, 200),
        follow_up_date: follow_up_date ?? null,
      });
    }

    return NextResponse.json({ data: logged }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
