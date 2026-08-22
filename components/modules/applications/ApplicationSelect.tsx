"use client";
import { useApplications } from "@/hooks/useApplications";

interface ApplicationSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  allowNone?: boolean;
  className?: string;
}

export function ApplicationSelect({
  value,
  onChange,
  required = false,
  allowNone = true,
  className,
}: ApplicationSelectProps) {
  const { applications, isLoading } = useApplications();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={isLoading}
      className={
        className ??
        "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      }
    >
      {allowNone && <option value="">— No application —</option>}
      {!allowNone && !value && <option value="">Select an application…</option>}
      {applications.map((app) => (
        <option key={app.id} value={app.id}>
          {app.university_name} — {app.program_name}
        </option>
      ))}
    </select>
  );
}
