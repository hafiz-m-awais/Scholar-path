"use client";

import { useRef, useState, Suspense } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { DOCUMENT_TYPE_LABELS, type DocumentType } from "@/lib/types";
import { ArrowLeft, FileText, Loader2, UploadCloud, X } from "lucide-react";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadDocumentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<DocumentType>("cv");
  const [versionLabel, setVersionLabel] = useState("v1");
  const [notes, setNotes] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyFile = (f: File) => {
    setError(null);
    if (!ALLOWED_MIME_TYPES.includes(f.type)) {
      setError("File type not allowed. Use PDF, DOCX, JPEG, PNG, or WEBP.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10MB limit.");
      return;
    }
    setFile(f);
    setName((prev) => (prev ? prev : f.name.replace(/\.[^/.]+$/, "")));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) applyFile(f);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) applyFile(f);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter a document name.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name.trim());
      formData.append("type", type);
      formData.append("version_label", versionLabel.trim() || "v1");
      if (notes.trim()) formData.append("notes", notes.trim());
      if (applicationId) formData.append("application_id", applicationId);

      const res = await fetch("/api/v1/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Failed to upload document");
      }

      if (applicationId) {
        router.push(`/applications/${applicationId}`);
      } else {
        router.push("/documents");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        {applicationId ? (
          <Link href={`/applications/${applicationId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Application
          </Link>
        ) : (
          <Link href="/documents" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Link>
        )}
      </div>
      <PageHeader title="Upload Document" description={applicationId ? "Upload and link document to application" : "Add a new document to your library"} />

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 px-4 cursor-pointer transition-colors ${
            dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
          />
          {file ? (
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
              <span className="font-medium truncate max-w-[220px]">{file.name}</span>
              <span className="text-gray-400 shrink-0">({formatBytes(file.size)})</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="text-gray-400 hover:text-red-600 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">PDF, DOCX, JPEG, PNG, WEBP up to 10MB</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CV - Research Focus"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Version Label</label>
            <input
              type="text"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="v1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional notes about this document version"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Upload Document
          </button>
        </div>
      </form>
    </div>
  );
}

export default function UploadDocumentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <UploadDocumentForm />
    </Suspense>
  );
}
