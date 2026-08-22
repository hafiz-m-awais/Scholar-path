"use client";
import { useState, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import type { Document } from "@/lib/types";

interface UploadVersionModalProps {
  parentDocument: Document;
  onClose: () => void;
  onUploaded: () => void;
}

export function UploadVersionModal({ parentDocument, onClose, onUploaded }: UploadVersionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [versionLabel, setVersionLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-suggest next version label
  const currentVersion = parentDocument.version_label ?? "v1";
  const suggestedVersion = (() => {
    const match = currentVersion.match(/v(\d+)$/);
    if (match) return `v${parseInt(match[1]) + 1}`;
    return `${currentVersion}-2`;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }

    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", parentDocument.name);
      fd.append("type", parentDocument.type);
      fd.append("version_label", versionLabel || suggestedVersion);
      fd.append("notes", notes);
      fd.append("parent_document_id", parentDocument.id);

      const res = await fetch("/api/v1/documents", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onUploaded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Upload New Version</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
            Uploading new version of <strong className="text-gray-700">{parentDocument.name}</strong>{" "}
            (current: <span className="font-mono">{currentVersion}</span>)
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">File *</label>
            <input type="file" ref={fileRef} onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-sm text-gray-500"
            >
              <Upload className="w-6 h-6 text-gray-400" />
              {file ? (
                <span className="font-medium text-gray-700">{file.name}</span>
              ) : (
                <span>Click to select file (PDF, DOCX, JPG, PNG)</span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Version Label</label>
              <input
                type="text"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                placeholder={suggestedVersion}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What changed?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? "Uploading…" : "Upload Version"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
