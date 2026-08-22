import type { Application } from "@/lib/types";
import { formatDate } from "@/lib/utils/dates";
import { ExternalLink } from "lucide-react";

interface OverviewTabProps {
  application: Application;
  onStatusChange: () => void;
}

const Field = ({ label, value }: { label: string; value?: string | number | null }) =>
  value ? (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
    </div>
  ) : null;

export function OverviewTab({ application }: OverviewTabProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
        <Field label="University" value={application.university_name} />
        <Field label="Program" value={application.program_name} />
        <Field label="Department" value={application.department} />
        <Field label="Country" value={application.country} />
        <Field label="City" value={application.city} />
        <Field label="Degree" value={application.degree_type} />
        <Field label="Intake" value={application.intake} />
        <Field label="Funding" value={application.funding_type?.replace("_", " ")} />
        <Field label="Priority" value={application.priority} />
        <Field label="Application Deadline" value={formatDate(application.application_deadline)} />
        <Field label="Scholarship Deadline" value={formatDate(application.scholarship_deadline)} />
        <Field
          label="Application Fee"
          value={application.application_fee ? `${application.application_fee} ${application.fee_currency}` : null}
        />
      </dl>

      {(application.application_portal_url || application.university_url) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 flex-wrap">
          {application.application_portal_url && (
            <a
              href={application.application_portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Application Portal
            </a>
          )}
          {application.university_url && (
            <a
              href={application.university_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              University Website
            </a>
          )}
        </div>
      )}

      {application.funding_notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Funding Notes</p>
          <p className="text-sm text-gray-700">{application.funding_notes}</p>
        </div>
      )}
    </div>
  );
}
