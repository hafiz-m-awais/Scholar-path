import Link from "next/link";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { ArrowRight } from "lucide-react";

interface DeadlineItem {
  id: string;
  label: string;
  date: string;
  application: { id: string; university_name: string; program_name: string };
}

export function UpcomingDeadlines({ deadlines }: { deadlines: DeadlineItem[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Upcoming Deadlines</h2>
        <Link
          href="/tasks"
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {deadlines.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-gray-400 mb-2">No upcoming deadlines in the next 30 days</p>
          <Link href="/tasks" className="text-xs text-indigo-600 hover:underline">
            + Add a deadline
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {deadlines.map((d) => (
            <li key={d.id}>
              <Link
                href={`/applications/${d.application.id}`}
                className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                    {d.application.university_name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{d.label}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <UrgencyBadge date={d.date} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
