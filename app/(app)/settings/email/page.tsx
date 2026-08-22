"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Mail, Loader2, ExternalLink } from "lucide-react";

function EmailSettingsContent() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");
  const error = searchParams.get("error");

  const [account, setAccount] = useState<{ email_address: string; is_connected: boolean; connected_at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/v1/email/account")
      .then((r) => r.json())
      .then((j) => setAccount(j.data))
      .finally(() => setLoading(false));
  }, [connected]);

  const handleConnect = async () => {
    setConnecting(true);
    const res = await fetch("/api/v1/email/connect", { method: "POST" });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    setConnecting(false);
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    await fetch("/api/v1/email/disconnect", { method: "DELETE" });
    setAccount(null);
    setDisconnecting(false);
  };

  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Settings
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Email / Gmail</h1>
      <p className="text-sm text-gray-500 mb-6">
        Connect your Gmail account to send emails directly from ScholarPath.
        Only the <code className="bg-gray-100 px-1 rounded text-xs">gmail.send</code> scope is requested.
      </p>

      {connected && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          Gmail connected successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2 text-sm text-red-700">
          <XCircle className="w-4 h-4" />
          {error === "gmail_denied" ? "Gmail access was denied." : "Failed to connect Gmail. Please try again."}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : account?.is_connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Connected</p>
                <p className="text-xs text-gray-500">{account.email_address}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
            >
              {disconnecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Disconnect Gmail
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">No Gmail account connected.</p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {connecting ? "Redirecting…" : "Connect Gmail"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmailSettingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg">
        <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      </div>
    }>
      <EmailSettingsContent />
    </Suspense>
  );
}
