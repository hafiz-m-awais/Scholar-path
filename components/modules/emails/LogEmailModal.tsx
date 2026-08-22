"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X } from "lucide-react";
import type { LogEmailData } from "@/lib/types";

interface LogEmailModalProps {
  prefill?: Partial<LogEmailData>;
  onClose: () => void;
  onLogged: () => void;
}

export function LogEmailModal({ prefill = {}, onClose, onLogged }: LogEmailModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<LogEmailData>({
    defaultValues: {
      to_email: "",
      to_name: "",
      subject: "",
      body_text: "",
      sent_at: new Date().toISOString().split("T")[0],
      ...prefill,
    },
  });

  const onSubmit = async (data: LogEmailData) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/email/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          application_id: prefill.application_id,
          supervisor_id: prefill.supervisor_id,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to log email");
      }
      onLogged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Log Received Email</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <p className="text-xs text-gray-500">
            Use this to record a reply or email you received outside PhD OS (e.g. in your inbox), so it shows up in your timeline.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From (Email) *</label>
              <input
                type="email"
                {...register("to_email", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="professor@university.edu"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                {...register("to_name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Prof. Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
            <input
              type="text"
              {...register("subject", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Re: PhD Application Inquiry"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
            <textarea
              {...register("body_text", { required: true })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Paste or summarize the email you received…"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date Received</label>
            <input
              type="date"
              {...register("sent_at")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : "Log Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
