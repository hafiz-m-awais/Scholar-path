"use client";
import { useState } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { DOCUMENT_TYPE_LABELS } from "@/lib/types";
import type { Document } from "@/lib/types";
import { useUIStore } from "@/store/uiStore";
import { FileText, Upload, Loader2, Trash2, Star, Eye, GitBranch } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { DocumentPreviewModal } from "@/components/modules/documents/DocumentPreviewModal";
import { UploadVersionModal } from "@/components/modules/documents/UploadVersionModal";

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { documents, isLoading, mutate } = useDocuments();
  const { openConfirmDialog } = useUIStore();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [versionDoc, setVersionDoc] = useState<Document | null>(null);
  // Track which groups are expanded to show version history
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  // Group by type, then group versions under their parent
  const grouped = documents.reduce<Record<string, Document[]>>((acc, doc) => {
    // Only show root documents (no parent) at top level
    if (!doc.parent_document_id) {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
    }
    return acc;
  }, {});

  // Get version children for a given document id
  const getVersions = (parentId: string): Document[] =>
    documents.filter((d) => d.parent_document_id === parentId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const handleSetActive = async (id: string) => {
    setPendingId(id);
    try {
      const res = await fetch(`/api/v1/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
      if (!res.ok) throw new Error("Failed to set active version");
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to set active version");
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    openConfirmDialog({
      title: "Delete Document",
      description: `Are you sure you want to delete "${name}"? This cannot be undone.`,
      onConfirm: async () => {
        setPendingId(id);
        try {
          const res = await fetch(`/api/v1/documents/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete document");
          await mutate();
        } catch (err) {
          alert(err instanceof Error ? err.message : "Failed to delete document");
        } finally {
          setPendingId(null);
        }
      },
    });
  };

  const toggleVersions = (docId: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const DocRow = ({ doc, isVersion = false }: { doc: Document; isVersion?: boolean }) => {
    const versions = getVersions(doc.id);
    const expanded = expandedVersions.has(doc.id);

    return (
      <>
        <li className={cn("px-4 py-3 flex items-center gap-3", isVersion && "pl-10 bg-gray-50/60")}>
          <FileText className={cn("w-4 h-4 shrink-0", isVersion ? "text-indigo-300" : "text-gray-400")} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
            <p className="text-xs text-gray-400">
              <span className="font-mono text-indigo-600">{doc.version_label}</span>
              {doc.file_size ? ` · ${formatBytes(doc.file_size)}` : ""}
              {` · ${formatDate(doc.created_at)}`}
            </p>
            {doc.notes && <p className="text-xs text-gray-400 truncate">{doc.notes}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Version History toggle */}
            {!isVersion && versions.length > 0 && (
              <button
                onClick={() => toggleVersions(doc.id)}
                className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700"
                title="Show version history"
              >
                <GitBranch className="w-3.5 h-3.5" />
                {versions.length}v {expanded ? "▴" : "▾"}
              </button>
            )}

            {/* Active badge */}
            {doc.is_active ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
                Active
              </span>
            ) : (
              <button
                onClick={() => handleSetActive(doc.id)}
                disabled={pendingId === doc.id}
                title="Set as active version"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-amber-600 disabled:opacity-50"
              >
                <Star className="w-3.5 h-3.5" />
                Set Active
              </button>
            )}

            {/* Preview button */}
            <button
              onClick={() => setPreviewDoc(doc)}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
              title="Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>

            {/* Upload new version */}
            {!isVersion && (
              <button
                onClick={() => setVersionDoc(doc)}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600"
                title="Upload new version"
              >
                <Upload className="w-3.5 h-3.5" />
                New Ver.
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => handleDelete(doc.id, doc.name)}
              disabled={pendingId === doc.id}
              title="Delete document"
              className={cn("text-gray-400 hover:text-red-600 disabled:opacity-50")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </li>
        {/* Version history rows */}
        {!isVersion && expanded && versions.map((v) => (
          <DocRow key={v.id} doc={v} isVersion />
        ))}
      </>
    );
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Global document library with version history"
        action={
          <Link
            href="/documents/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : documents.filter((d) => !d.parent_document_id).length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title="No documents yet"
          description="Upload your CV, SOP, transcripts, and other application documents."
          action={
            <Link
              href="/documents/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, docs]) => (
            <div key={type} className="bg-white rounded-lg border border-gray-200">
              <h3 className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100">
                {DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS] ?? type}
                <span className="ml-2 text-xs font-normal text-gray-400">({docs.length})</span>
              </h3>
              <ul className="divide-y divide-gray-50">
                {docs.map((doc) => <DocRow key={doc.id} doc={doc} />)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          documentId={previewDoc.id}
          documentName={previewDoc.name}
          mimeType={previewDoc.mime_type}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Upload Version Modal */}
      {versionDoc && (
        <UploadVersionModal
          parentDocument={versionDoc}
          onClose={() => setVersionDoc(null)}
          onUploaded={() => {
            setVersionDoc(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}
