import Link from "next/link";
import { formatRelative } from "@/lib/utils/dates";
import { Mail, FileUp, RefreshCw, CheckSquare, SendHorizontal, ArrowRight } from "lucide-react";

interface ActivityItem {
  type: string;
  description: string;
  created_at: string;
  application_id?: string;
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  email_sent: Mail,
  document_uploaded: FileUp,
  status_changed: RefreshCw,
  task_completed: CheckSquare,
  submission_logged: SendHorizontal,
};

// Map activity type to a sensible destination
function getActivityHref(a: ActivityItem): string {
  if (a.application_id) return `/applications/${a.application_id}`;
  switch (a.type) {
    case "email_sent": return "/emails";
    case "document_uploaded": return "/documents";
    case "task_completed": return "/tasks";
    case "submission_logged": return "/submissions";
    default: return "/applications";
  }
}

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
        <Link
          href="/applications"
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
        >
          Applications <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {activities.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-gray-400 mb-2">No recent activity</p>
          <Link href="/applications/new" className="text-xs text-indigo-600 hover:underline">
            + Add your first application
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {activities.map((a, i) => {
            const Icon = activityIcons[a.type] ?? RefreshCw;
            const href = getActivityHref(a);
            return (
              <li key={i}>
                <Link
                  href={href}
                  className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors group"
                >
                  <Icon className="w-4 h-4 mt-0.5 text-gray-400 shrink-0 group-hover:text-indigo-500 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                      {a.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelative(a.created_at)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
