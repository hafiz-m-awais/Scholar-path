"use client";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

const EXPORTED_ITEMS = [
  "Applications",
  "Supervisors & communication history",
  "Document metadata (names, types, versions — not the files themselves)",
  "Tasks & deadlines",
  "Sent and logged emails",
  "Submission logs",
  "Email templates",
];

export default function ExportSettingsPage() {
  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Settings
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Export Data</h1>
      <p className="text-sm text-gray-500 mb-6">
        Download a JSON snapshot of all your ScholarPath data.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">What&apos;s included:</p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            {EXPORTED_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-400">
            Uploaded files (CVs, transcripts, etc.) are not included in this export — only their
            metadata. Download individual files from the Documents page.
          </p>
        </div>

        <a
          href="/api/v1/settings/export"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          <Download className="w-4 h-4" />
          Download Export (.json)
        </a>
      </div>
    </div>
  );
}
