export type ContactStatus =
  | "not_contacted"
  | "email_sent"
  | "awaiting_response"
  | "replied"
  | "interested"
  | "meeting_scheduled"
  | "no_response";

export type CommunicationType =
  | "email_sent"
  | "reply_received"
  | "follow_up_sent"
  | "meeting"
  | "call"
  | "note";

export interface Supervisor {
  id: string;
  user_id: string;
  name: string;
  university_name: string | null;
  department: string | null;
  research_interests: string[];
  email: string | null;
  website_url: string | null;
  google_scholar_url: string | null;
  lab_url: string | null;
  contact_status: ContactStatus;
  last_contacted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupervisorApplication {
  id: string;
  supervisor_id: string;
  application_id: string;
  notes: string | null;
  created_at: string;
}

export interface SupervisorCommunication {
  id: string;
  user_id: string;
  supervisor_id: string;
  application_id: string | null;
  type: CommunicationType;
  date: string;
  subject: string | null;
  summary: string | null;
  follow_up_date: string | null;
  created_at: string;
}
