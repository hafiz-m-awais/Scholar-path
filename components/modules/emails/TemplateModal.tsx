"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X } from "lucide-react";
import type { EmailTemplate, EmailTemplateType } from "@/lib/types";

interface TemplateFormData {
  name: string;
  type: EmailTemplateType;
  subject_template: string;
  body_template: string;
}

interface TemplateModalProps {
  template?: EmailTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}

const TYPE_OPTIONS: { value: EmailTemplateType; label: string }[] = [
  { value: "inquiry", label: "Inquiry" },
  { value: "follow_up", label: "Follow-up" },
  { value: "thank_you", label: "Thank You" },
  { value: "status_request", label: "Status Request" },
  { value: "other", label: "Other" },
];

export function TemplateModal({ template, onClose, onSaved }: TemplateModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<TemplateFormData>({
    defaultValues: {
      name: template?.name ?? "",
      type: template?.type ?? "inquiry",
      subject_template: template?.subject_template ?? "",
      body_template: template?.body_template ?? "",
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        template ? `/api/v1/email/templates/${template.id}` : "/api/v1/email/templates",
        {
          method: template ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save template");
      }
      onSaved();
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
          <h2 className="text-sm font-semibold text-gray-900">
            {template ? "Edit Template" : "New Template"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Initial Supervisor Inquiry"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                {...register("type")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subject Template *</label>
            <input
              type="text"
              {...register("subject_template", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="PhD Application Inquiry – {{program}} at {{university}}"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Body Template *</label>
            <textarea
              {...register("body_template", { required: true })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder={"Dear Professor {{professor_name}},\n\n..."}
            />
            <p className="mt-1 text-xs text-gray-400">
              Use placeholders like {"{{professor_name}}"}, {"{{university}}"}, {"{{program}}"}.
            </p>
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
              {template ? "Save Changes" : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
