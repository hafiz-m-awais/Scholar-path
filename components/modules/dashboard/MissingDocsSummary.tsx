import Link from "next/link";
import { FileX } from "lucide-react";

export function MissingDocsSummary({ count }: { count: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Missing Documents</h2>
      {count === 0 ? (
        <p className="text-sm text-green-600 font-medium">
          All documents are accounted for ✓
        </p>
      ) : (
        <div className="flex items-start gap-3">
          <FileX className="w-8 h-8 text-red-400 shrink-0" />
          <div>
            <div className="text-2xl font-bold text-red-600">{count}</div>
            <p className="text-xs text-gray-500">
              {count === 1 ? "application has" : "applications have"} missing required documents
            </p>
            <Link
              href="/applications?missing_docs=true"
              className="text-xs text-indigo-600 hover:underline mt-1 block"
            >
              View details →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
