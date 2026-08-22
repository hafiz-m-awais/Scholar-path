export type EmailTemplateType =
  | "inquiry"
  | "follow_up"
  | "thank_you"
  | "status_request"
  | "other";

export interface EmailAccount {
  id: string;
  user_id: string;
  email_address: string;
  provider: "gmail" | "outlook";
  token_expires_at: string | null;
  scopes: string[];
  is_connected: boolean;
  connected_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface SentEmail {
  id: string;
  user_id: string;
  application_id: string | null;
  supervisor_id: string | null;
  direction: "sent" | "received";
  to_email: string;
  to_name: string | null;
  subject: string;
  body_text: string | null;
  body_html: string | null;
  attachments: EmailAttachment[];
  sent_at: string;
  gmail_message_id: string | null;
  follow_up_date: string | null;
  follow_up_done: boolean;
  template_used: string | null;
  tracking_id: string | null;
  read_at: string | null;
  scheduled_for: string | null;
  status: "sent" | "scheduled" | "failed";
  created_at: string;
}

export interface EmailAttachment {
  document_id: string;
  file_name: string;
  file_size: number;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  type: EmailTemplateType;
  subject_template: string;
  body_template: string;
  created_at: string;
  updated_at: string;
}

export interface ComposeEmailData {
  to_email: string;
  to_name?: string;
  subject: string;
  body_text: string;
  body_html?: string;
  application_id?: string;
  supervisor_id?: string;
  attachment_ids?: string[];
  attachments?: Array<{
    filename: string;
    content_base64: string;
    mimeType: string;
  }>;
  follow_up_date?: string;
  template_used?: string;
}

export interface LogEmailData {
  to_email: string;
  to_name?: string;
  subject: string;
  body_text: string;
  sent_at?: string;
  application_id?: string;
  supervisor_id?: string;
}
