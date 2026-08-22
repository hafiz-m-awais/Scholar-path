export type DocumentType =
  | "cv"
  | "sop"
  | "research_statement"
  | "cover_letter"
  | "transcript"
  | "degree_certificate"
  | "passport"
  | "recommendation_letter"
  | "english_test"
  | "research_proposal"
  | "email_template"
  | "other";

export type DocumentStatus = "missing" | "attached" | "submitted" | "not_needed";

export interface Document {
  id: string;
  user_id: string;
  name: string;
  type: DocumentType;
  version_label: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  notes: string | null;
  tags: string[];
  is_active: boolean;
  parent_document_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_id: string | null;
  document_type: DocumentType;
  is_required: boolean;
  is_not_needed: boolean;
  status: DocumentStatus;
  submitted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  document?: Document;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  cv: "CV / Resume",
  sop: "Statement of Purpose",
  research_statement: "Research Statement",
  cover_letter: "Cover Letter",
  transcript: "Transcript",
  degree_certificate: "Degree Certificate",
  passport: "Passport",
  recommendation_letter: "Recommendation Letter",
  english_test: "English Test (IELTS/TOEFL)",
  research_proposal: "Research Proposal",
  email_template: "Email Template",
  other: "Other",
};
