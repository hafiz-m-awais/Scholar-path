export type SubmissionMethod =
  | "email"
  | "portal"
  | "post"
  | "hand_delivered"
  | "other";

export interface SubmissionLog {
  id: string;
  user_id: string;
  application_id: string;
  supervisor_id: string | null;
  sent_to_label: string;
  method: SubmissionMethod;
  sent_at: string;
  confirmed: boolean;
  notes: string | null;
  created_at: string;
  documents?: SubmissionDocument[];
}

export interface SubmissionDocument {
  id: string;
  submission_log_id: string;
  document_id: string | null;
  document_name_snapshot: string;
  document_version_label: string | null;
}
