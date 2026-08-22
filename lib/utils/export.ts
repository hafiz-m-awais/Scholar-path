import type { Application } from "@/lib/types";

export function exportApplicationsToCSV(applications: Application[]) {
  if (!applications || applications.length === 0) return;

  const headers = [
    "University",
    "Program",
    "Department",
    "Country",
    "City",
    "Degree Type",
    "Intake",
    "Application Deadline",
    "Scholarship Deadline",
    "Fee",
    "Currency",
    "Funding Type",
    "Priority",
    "Status",
    "Created At",
  ];

  const escapeCSV = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = applications.map((app) => [
    app.university_name,
    app.program_name,
    app.department,
    app.country,
    app.city,
    app.degree_type,
    app.intake,
    app.application_deadline,
    app.scholarship_deadline,
    app.application_fee,
    app.fee_currency,
    app.funding_type,
    app.priority,
    app.status,
    new Date(app.created_at).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `phd_applications_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
