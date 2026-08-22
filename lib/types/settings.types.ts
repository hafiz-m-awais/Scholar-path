export type Theme = "light" | "dark" | "system";

export interface UserSettings {
  id: string;
  user_id: string;
  display_name: string | null;
  deadline_reminder_days: number[];
  follow_up_reminders: boolean;
  missing_doc_reminders: boolean;
  theme: Theme;
  created_at: string;
  updated_at: string;
}
