import Link from "next/link";
import { AlertCircle, Clock, FileX, Clipboard, ArrowRight } from "lucide-react";
import { formatDaysUntil } from "@/lib/utils/dates";
import { useComposeStore } from "@/store/composeStore";

interface ActionItem {
  type: string;
  title: string;
  application_name: string;
  application_id: string;
  due_date?: string;
  supervisor_id?: string;
  original_subject?: string;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  task: Clock,
  missing_doc: FileX,
  follow_up: AlertCircle,
  status: Clipboard,
};

function getActionHref(item: ActionItem): string {
  switch (item.type) {
    case "task":
      return `/applications/${item.application_id}`;
    case "missing_doc":
      return `/applications/${item.application_id}`;
    default:
      return `/applications/${item.application_id}`;
  }
}

export function ActionRequired({ items }: { items: ActionItem[] }) {
  const { openCompose } = useComposeStore();

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Action Required</h2>
        <Link
          href="/tasks"
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
        >
          All tasks <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-gray-400 mb-2">All clear — nothing urgent right now 🎉</p>
          <Link href="/tasks" className="text-xs text-indigo-600 hover:underline">
            + Add a task
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {items.slice(0, 8).map((item, i) => {
            const Icon = typeIcons[item.type] ?? AlertCircle;
            
            const content = (
              <>
                <Icon className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-700 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-indigo-600">
                    {item.application_name}
                  </div>
                </div>
                {item.due_date && (
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatDaysUntil(item.due_date)}
                  </span>
                )}
              </>
            );

            if (item.type === "follow_up") {
              return (
                <li key={i}>
                  <button
                    onClick={() => {
                      openCompose({
                        application_id: item.application_id,
                        supervisor_id: item.supervisor_id,
                        subject: item.original_subject ? `Re: ${item.original_subject}` : "Following up",
                      });
                    }}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-orange-50/50 transition-colors group cursor-pointer"
                  >
                    {content}
                  </button>
                </li>
              );
            }

            return (
              <li key={i}>
                <Link
                  href={getActionHref(item)}
                  className="px-4 py-3 flex items-start gap-3 hover:bg-orange-50/50 transition-colors group cursor-pointer"
                >
                  {content}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
