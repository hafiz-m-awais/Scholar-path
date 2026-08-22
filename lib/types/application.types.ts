export type DegreeType = "PhD" | "MSc" | "Other";
export type FundingType =
  | "fully_funded"
  | "partially_funded"
  | "self_funded"
  | "unknown";
export type Priority = "low" | "medium" | "high";
export type ApplicationStatus =
  | "researching"
  | "preparing"
  | "submitted"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  user_id: string;
  university_name: string;
  program_name: string;
  department: string | null;
  country: string | null;
  city: string | null;
  degree_type: DegreeType;
  intake: string | null;
  application_deadline: string | null;
  scholarship_deadline: string | null;
  application_portal_url: string | null;
  university_url: string | null;
  application_fee: number | null;
  fee_currency: string;
  funding_type: FundingType;
  funding_notes: string | null;
  priority: Priority;
  status: ApplicationStatus;
  phd_description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationFormData {
  university_name: string;
  program_name: string;
  department?: string;
  country?: string;
  city?: string;
  degree_type: DegreeType;
  intake?: string;
  application_deadline?: string;
  scholarship_deadline?: string;
  application_portal_url?: string;
  university_url?: string;
  application_fee?: number;
  fee_currency: string;
  funding_type: FundingType;
  funding_notes?: string;
  priority: Priority;
  status: ApplicationStatus;
  phd_description?: string;
  notes?: string;
}
