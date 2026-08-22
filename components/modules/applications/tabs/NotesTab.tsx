"use client";
import { useState } from "react";
import type { Application } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface NotesTabProps {
  application: Application;
  onSave: () => void;
}

export function NotesTab({ application, onSave }: NotesTabProps) {
  const [notes, setNotes] = useState(application.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/v1/applications/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSave();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        rows={12}
        placeholder="Add notes, thoughts, reminders about this application…"
        className="w-full px-0 py-0 border-0 text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
      />
      <div className="flex justify-end pt-3 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saved ? "Saved ✓" : "Save Notes"}
        </button>
      </div>
    </div>
  );
}
