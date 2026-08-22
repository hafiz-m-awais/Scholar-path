"use client";
import { usePortal } from "@/hooks/usePortal";
import { useState } from "react";
import { ExternalLink, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";

interface PortalTabProps { applicationId: string; }

export function PortalTab({ applicationId }: PortalTabProps) {
  const { links, credentials, isLoading } = usePortal(applicationId);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    // Clear after 30 seconds
    setTimeout(() => navigator.clipboard.writeText(""), 30_000);
  };

  const toggleShow = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
    // Auto-mask after 10 seconds
    if (!showPassword[id]) {
      setTimeout(() => setShowPassword((prev) => ({ ...prev, [id]: false })), 10_000);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Links */}
      <div className="bg-white rounded-lg border border-gray-200">
        <h3 className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100">
          Quick Links
        </h3>
        {links.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400 text-center">No links added yet</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {links.map((link) => (
              <li key={link.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-400 truncate">{link.url}</p>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Credentials */}
      <div className="bg-white rounded-lg border border-gray-200">
        <h3 className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100">
          Portal Credentials
        </h3>
        {credentials.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400 text-center">No credentials saved yet</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {credentials.map((cred) => (
              <li key={cred.id} className="px-4 py-4 space-y-2">
                {cred.username && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Username</p>
                      <p className="text-sm text-gray-900">{cred.username}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cred.username!)}
                      className="p-1.5 rounded text-gray-400 hover:text-gray-600"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {cred.password && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Password</p>
                      <p className="text-sm font-mono text-gray-900">
                        {showPassword[cred.id] ? cred.password : "••••••••••••"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleShow(cred.id)}
                        className="p-1.5 rounded text-gray-400 hover:text-gray-600"
                        title={showPassword[cred.id] ? "Hide" : "Show 10s"}
                      >
                        {showPassword[cred.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(cred.password!)}
                        className="p-1.5 rounded text-gray-400 hover:text-gray-600"
                        title="Copy (cleared in 30s)"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                {cred.application_reference_id && (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Application Reference</p>
                      <p className="text-sm text-gray-900">{cred.application_reference_id}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cred.application_reference_id!)}
                      className="p-1.5 rounded text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    cred.status === "active" ? "bg-green-100 text-green-700 border-green-200" :
                    cred.status === "submitted" ? "bg-blue-100 text-blue-700 border-blue-200" :
                    cred.status === "expired" ? "bg-red-100 text-red-700 border-red-200" :
                    "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>
                    {cred.status.replace("_", " ")}
                  </span>
                  {cred.last_used_at && (
                    <span className="text-xs text-gray-400">Last used {formatDate(cred.last_used_at)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
