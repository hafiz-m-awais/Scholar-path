"use client";
import type { ContactStatus } from "@/lib/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface QuickStatusActionsProps {
  supervisorId: string;
  currentStatus: ContactStatus;
  onUpdate: () => void;
}

export function QuickStatusActions({ supervisorId, currentStatus, onUpdate }: QuickStatusActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (status: ContactStatus, commType?: string) => {
    setLoading(status);
    await fetch(`/api/v1/supervisors/${supervisorId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact_status: status, log_type: commType }),
    });
    onUpdate();
    setLoading(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => updateStatus("replied", "reply_received")}
          disabled={!!loading || currentStatus === "replied"}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 disabled:opacity-40"
        >
          {loading === "replied" && <Loader2 className="w-3 h-3 animate-spin" />}
          ✓ Mark Replied
        </button>
        <button
          onClick={() => updateStatus("awaiting_response", "follow_up_sent")}
          disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 disabled:opacity-40"
        >
          {loading === "awaiting_response" && <Loader2 className="w-3 h-3 animate-spin" />}
          ↩ Log Follow-up
        </button>
        <button
          onClick={() => updateStatus("no_response", "note")}
          disabled={!!loading || currentStatus === "no_response"}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-40"
        >
          {loading === "no_response" && <Loader2 className="w-3 h-3 animate-spin" />}
          ✗ Mark No Response
        </button>
      </div>
    </div>
  );
}
