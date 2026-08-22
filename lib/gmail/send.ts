import { google } from "googleapis";

interface SendEmailOptions {
  accessToken: string;
  to: string;
  toName?: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    mimeType: string;
  }>;
}

export async function sendGmailEmail(
  opts: SendEmailOptions
): Promise<{ messageId: string }> {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({ access_token: opts.accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  const toHeader = opts.toName
    ? `"${opts.toName}" <${opts.to}>`
    : opts.to;

  // Build raw MIME message
  const boundary = `boundary_${Date.now()}`;
  const hasHtml = !!opts.bodyHtml;
  const hasAttachments = opts.attachments && opts.attachments.length > 0;

  let raw: string;

  if (!hasAttachments && !hasHtml) {
    // Plain text only
    raw = [
      `To: ${toHeader}`,
      `Subject: ${opts.subject}`,
      `Content-Type: text/plain; charset=utf-8`,
      `MIME-Version: 1.0`,
      ``,
      opts.bodyText,
    ].join("\r\n");
  } else {
    // Multipart
    const parts: string[] = [];
    parts.push(
      `Content-Type: text/plain; charset=utf-8\r\n\r\n${opts.bodyText}`
    );
    if (hasHtml) {
      parts.push(
        `Content-Type: text/html; charset=utf-8\r\n\r\n${opts.bodyHtml}`
      );
    }
    if (hasAttachments) {
      for (const att of opts.attachments!) {
        const b64 = att.content.toString("base64");
        parts.push(
          [
            `Content-Type: ${att.mimeType}`,
            `Content-Disposition: attachment; filename="${att.filename}"`,
            `Content-Transfer-Encoding: base64`,
            ``,
            b64,
          ].join("\r\n")
        );
      }
    }
    raw = [
      `To: ${toHeader}`,
      `Subject: ${opts.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      ...parts.map((p) => `--${boundary}\r\n${p}`),
      `--${boundary}--`,
    ].join("\r\n");
  }

  const encoded = Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded },
  });

  return { messageId: result.data.id ?? "" };
}
