"use client";
import { cn } from "@/lib/utils/cn";
import type { ContactStatus } from "@/lib/types";

const STATUS_CONFIG: Record<ContactStatus, { label: string; className: string }> = {
  not_contacted: { label: "Not Contacted", className: "bg-gray-100 text-gray-600 border-gray-200" },
  email_sent: { label: "Email Sent", className: "bg-blue-100 text-blue-700 border-blue-200" },
  awaiting_response: { label: "Awaiting Response", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  replied: { label: "Replied", className: "bg-green-100 text-green-700 border-green-200" },
  interested: { label: "Interested", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  meeting_scheduled: { label: "Meeting Scheduled", className: "bg-purple-100 text-purple-700 border-purple-200" },
  no_response: { label: "No Response", className: "bg-red-100 text-red-600 border-red-200" },
};

export const contactStatusConfig = STATUS_CONFIG;

export function ContactStatusBadge({ status, className }: { status: ContactStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className, className)}>
      {config.label}
    </span>
  );
}
