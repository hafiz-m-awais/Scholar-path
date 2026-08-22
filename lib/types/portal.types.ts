export type PortalCredentialStatus =
  | "not_created"
  | "active"
  | "submitted"
  | "expired";

export type LinkLabel =
  | "Application Portal"
  | "University"
  | "Program"
  | "Supervisor"
  | "Department"
  | "Funding"
  | "Other";

export interface ApplicationLink {
  id: string;
  application_id: string;
  user_id: string;
  label: string;
  url: string;
  notes: string | null;
  pinned: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PortalCredential {
  id: string;
  application_id: string;
  user_id: string;
  portal_url: string | null;
  username: string | null;
  application_reference_id: string | null;
  security_question: string | null;
  notes: string | null;
  status: PortalCredentialStatus;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  // Decrypted fields — only returned from server
  password?: string;
  pin?: string;
  security_answer?: string;
}
