"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function NotificationSettingsPage() {
  const { settings, isLoading, mutate } = useSettings();

  const [displayName, setDisplayName] = useState("");
  const [reminderDays, setReminderDays] = useState("14,7,3,1");
  const [followUpReminders, setFollowUpReminders] = useState(true);
  const [missingDocReminders, setMissingDocReminders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setDisplayName(settings.display_name ?? "");
      setReminderDays((settings.deadline_reminder_days ?? [14, 7, 3, 1]).join(", "));
      setFollowUpReminders(settings.follow_up_reminders);
      setMissingDocReminders(settings.missing_doc_reminders);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const days = reminderDays
        .split(",")
        .map((d) => parseInt(d.trim(), 10))
        .filter((d) => !isNaN(d) && d >= 0);

      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim() || null,
          deadline_reminder_days: days.length ? days : [14, 7, 3, 1],
          follow_up_reminders: followUpReminders,
          missing_doc_reminders: missingDocReminders,
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      await mutate();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Settings
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Notifications</h1>
      <p className="text-sm text-gray-500 mb-6">Configure deadline reminder preferences.</p>

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Reminder Days</label>
            <input
              type="text"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              placeholder="14, 7, 3, 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-400">Comma-separated number of days before a deadline to be reminded.</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={followUpReminders}
              onChange={(e) => setFollowUpReminders(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Remind me about pending supervisor follow-ups</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={missingDocReminders}
              onChange={(e) => setMissingDocReminders(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Remind me about missing application documents</span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          {saved && !error && (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved.
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
