export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type DeadlineType =
  | "application"
  | "scholarship"
  | "recommendation"
  | "document"
  | "interview"
  | "follow_up"
  | "other";

export interface Task {
  id: string;
  user_id: string;
  application_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deadline {
  id: string;
  user_id: string;
  application_id: string;
  type: DeadlineType;
  label: string;
  date: string;
  reminder_days: number[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type UrgencyLevel = "red" | "orange" | "yellow" | "green";
