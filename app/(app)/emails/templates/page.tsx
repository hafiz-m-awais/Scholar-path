"use client";
import { useState } from "react";
import Link from "next/link";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { useUIStore } from "@/store/uiStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { TemplateModal } from "@/components/modules/emails/TemplateModal";
import type { EmailTemplate } from "@/lib/types";
import { ArrowLeft, FileText, Plus, Loader2, Edit, Trash2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  inquiry: "Inquiry",
  follow_up: "Follow-up",
  thank_you: "Thank You",
  status_request: "Status Request",
  other: "Other",
};

export default function EmailTemplatesPage() {
  const { templates, isLoading, mutate } = useEmailTemplates();
  const { openConfirmDialog } = useUIStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (template: EmailTemplate) => {
    setEditing(template);
    setModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    openConfirmDialog({
      title: "Delete Template",
      description: `Are you sure you want to delete "${name}"? This cannot be undone.`,
      onConfirm: async () => {
        const res = await fetch(`/api/v1/email/templates/${id}`, { method: "DELETE" });
        if (res.ok) mutate();
      },
    });
  };

  return (
    <div>
      <div className="mb-4">
        <Link href="/emails" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Emails
        </Link>
      </div>

      <PageHeader
        title="Email Templates"
        description="Reusable templates for supervisor outreach"
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title="No templates yet"
          description="Create reusable templates for common outreach emails."
          action={
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {templates.map((template) => (
            <div key={template.id} className="px-4 py-4 flex items-start gap-3">
              <FileText className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{template.name}</p>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                    {TYPE_LABELS[template.type] ?? template.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{template.subject_template}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{template.body_template}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(template)}
                  className="text-gray-400 hover:text-indigo-600"
                  title="Edit template"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(template.id, template.name)}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TemplateModal
          template={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}
