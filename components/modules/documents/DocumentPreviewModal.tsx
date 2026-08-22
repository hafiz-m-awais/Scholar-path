"use client";
import { useState, useEffect } from "react";
import { X, ExternalLink, Loader2, FileText, Image as ImageIcon } from "lucide-react";

interface DocumentPreviewModalProps {
  documentId: string;
  documentName: string;
  mimeType?: string | null;
  onClose: () => void;
}

export function DocumentPreviewModal({ documentId, documentName, mimeType, onClose }: DocumentPreviewModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await fetch(`/api/v1/documents/${documentId}/signed-url`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load document");
        setSignedUrl(json.data.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load document");
      } finally {
        setLoading(false);
      }
    };
    fetchUrl();
  }, [documentId]);

  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType?.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ height: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
            <h2 className="text-sm font-semibold text-gray-900 truncate">{documentName}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in Tab
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden bg-gray-100 rounded-b-xl">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <FileText className="w-12 h-12 text-gray-300" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : isPdf && signedUrl ? (
            <iframe
              src={signedUrl}
              className="w-full h-full border-0"
              title={documentName}
            />
          ) : isImage && signedUrl ? (
            <div className="flex items-center justify-center h-full p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signedUrl}
                alt={documentName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-md"
              />
            </div>
          ) : signedUrl ? (
            // For DOCX and other non-previewable formats
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <FileText className="w-16 h-16 text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Preview not available</p>
                <p className="text-xs text-gray-500 mt-1">This file type cannot be previewed in the browser.</p>
              </div>
              <a
                href={signedUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                Download File
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
