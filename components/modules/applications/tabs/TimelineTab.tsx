"use client";
import { useTimeline } from "@/hooks/useTimeline";
import { Loader2, CheckCircle2, Clock, FileText, Mail, RefreshCw, AlertTriangle, Printer } from "lucide-react";
import { formatDateTime } from "@/lib/utils/dates";

interface TimelineTabProps {
  applicationId: string;
  applicationName?: string;
}

export function TimelineTab({ applicationId, applicationName = "Application" }: TimelineTabProps) {
  const { events, isLoading, error } = useTimeline(applicationId);

  const handlePrintReport = () => {
    // Inject print-specific styles
    const style = document.createElement("style");
    style.id = "__timeline-print-style";
    style.innerHTML = `
      @media print {
        body > *:not(#timeline-print-root) { display: none !important; }
        #timeline-print-root { display: block !important; }
        @page { margin: 2cm; }
      }
    `;
    document.head.appendChild(style);

    // Create a printable snapshot
    const printRoot = document.createElement("div");
    printRoot.id = "timeline-print-root";
    printRoot.style.display = "none";
    printRoot.innerHTML = `
      <h1 style="font-size:20px;font-weight:bold;margin-bottom:4px">${applicationName} — Progress Report</h1>
      <p style="font-size:12px;color:#6b7280;margin-bottom:24px">Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb">
            <th style="text-align:left;padding:8px 12px;font-weight:600">Event</th>
            <th style="text-align:left;padding:8px 12px;font-weight:600">Date</th>
            <th style="text-align:left;padding:8px 12px;font-weight:600">Type</th>
          </tr>
        </thead>
        <tbody>
          ${events.map((ev, i) => `
            <tr style="border-bottom:1px solid #f3f4f6;background:${i % 2 === 0 ? "#fff" : "#f9fafb"}">
              <td style="padding:8px 12px">${ev.title}</td>
              <td style="padding:8px 12px;color:#6b7280">${new Date(ev.date).toLocaleDateString()}</td>
              <td style="padding:8px 12px;color:#6b7280;text-transform:capitalize">${ev.type.replace(/_/g, " ")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    document.body.appendChild(printRoot);

    window.print();

    // Cleanup after print dialog
    setTimeout(() => {
      document.getElementById("__timeline-print-style")?.remove();
      document.getElementById("timeline-print-root")?.remove();
    }, 1000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-200">Failed to load timeline.</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No activity recorded yet.</p>
      </div>
    );
  }

  // Detect overdue events (have a date in the past with no completion)
  const now = new Date();
  const isOverdue = (event: typeof events[number]) => {
    const eventDate = new Date(event.date);
    return (
      eventDate < now &&
      event.type !== "task_completed" &&
      event.type !== "communication"
    );
  };

  return (
    <div className="max-w-2xl">
      {/* Header with Export button */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-700">
          {events.length} events
        </h3>
        <button
          onClick={handlePrintReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Printer className="w-3.5 h-3.5" />
          Export Progress Report
        </button>
      </div>

      <div className="relative border-l border-gray-200 ml-3 space-y-8 pb-8">
        {events.map((event) => {
          let Icon = Clock;
          let iconColor = "text-gray-500";
          let bgColor = "bg-gray-100";
          const overdue = isOverdue(event);

          if (overdue) {
            Icon = AlertTriangle;
            iconColor = "text-amber-600";
            bgColor = "bg-amber-100";
          } else {
            switch (event.type) {
              case "task_created":
                Icon = Clock;
                iconColor = "text-blue-600";
                bgColor = "bg-blue-100";
                break;
              case "task_completed":
                Icon = CheckCircle2;
                iconColor = "text-green-600";
                bgColor = "bg-green-100";
                break;
              case "document_uploaded":
                Icon = FileText;
                iconColor = "text-purple-600";
                bgColor = "bg-purple-100";
                break;
              case "communication":
                Icon = Mail;
                iconColor = "text-indigo-600";
                bgColor = "bg-indigo-100";
                break;
            }
          }

          return (
            <div key={event.id} className="relative pl-8">
              <div
                className={`absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white ${bgColor}`}
              >
                <Icon className={`h-3 w-3 ${iconColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  {overdue && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(event.date)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
