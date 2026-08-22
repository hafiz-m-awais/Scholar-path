"use client";
import { useState, useRef } from "react";
import type { ComposeEmailData } from "@/lib/types";
import { useForm, Controller } from "react-hook-form";
import { Loader2, X, Paperclip, File as FileIcon, ChevronDown, Clock, Variable } from "lucide-react";
import { TiptapEditor } from "@/components/shared/TiptapEditor";
import { MERGE_VARIABLE_OPTIONS, applyMerge, type MailMergeVariables } from "@/lib/utils/mailMerge";

interface ComposeModalProps {
  prefill?: Partial<ComposeEmailData>;
  onClose: () => void;
  onSent: () => void;
  /** Pre-filled merge variables from the supervisor/application context */
  mergeVars?: Partial<MailMergeVariables>;
}

export function ComposeModal({ prefill = {}, onClose, onSent, mergeVars = {} }: ComposeModalProps) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<{ file: File; base64: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showVarMenu, setShowVarMenu] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const editorRef = useRef<{ insertText: (text: string) => void } | null>(null);

  const defaultVars: MailMergeVariables = {
    today: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    ...mergeVars,
  };

  const { register, handleSubmit, control, getValues, setValue, formState: { errors } } = useForm<ComposeEmailData>({
    defaultValues: {
      to_email: "",
      to_name: "",
      subject: "",
      body_text: "",
      body_html: "",
      follow_up_date: "",
      ...prefill,
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = Array.from(e.target.files);
    const newAttachments = await Promise.all(
      newFiles.map(async (file) =>
        new Promise<{ file: File; base64: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve({ file, base64: (reader.result as string).split(",")[1] });
          reader.onerror = reject;
        })
      )
    );
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => setAttachments((prev) => prev.filter((_, i) => i !== index));

  /** Applies merge variables to subject + body before sending */
  const applyMergeToForm = () => {
    const subject = getValues("subject");
    const merged = applyMerge(subject, defaultVars);
    if (merged !== subject) setValue("subject", merged);
  };

  const onSubmit = async (data: ComposeEmailData) => {
    setSending(true);
    setError(null);
    // Apply merge to subject
    const finalSubject = applyMerge(data.subject, defaultVars);
    const finalHtml = data.body_html ? applyMerge(data.body_html, defaultVars) : data.body_html;
    const finalText = applyMerge(data.body_text, defaultVars);

    try {
      const res = await fetch("/api/v1/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          subject: finalSubject,
          body_html: finalHtml,
          body_text: finalText,
          application_id: prefill.application_id,
          supervisor_id: prefill.supervisor_id,
          attachments: attachments.map((att) => ({
            filename: att.file.name,
            content_base64: att.base64,
            mimeType: att.file.type,
          })),
          scheduled_for: scheduledFor || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to send email");
      }
      const json = await res.json();
      if (json.scheduled) {
        setScheduled(true);
        setTimeout(() => { onSent(); }, 2000);
      } else {
        onSent();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSending(false);
    }
  };

  if (scheduled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative bg-white rounded-xl shadow-xl p-8 text-center max-w-sm w-full">
          <Clock className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Scheduled!</h3>
          <p className="text-sm text-gray-500">
            Your email will be sent on{" "}
            <span className="font-medium text-indigo-600">
              {new Date(scheduledFor).toLocaleString()}
            </span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">Compose Email</h2>
          <div className="flex items-center gap-2">
            {/* Variables dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVarMenu((v) => !v)}
                title="Insert mail merge variable"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
              >
                <Variable className="w-3.5 h-3.5" />
                Variables
                <ChevronDown className="w-3 h-3" />
              </button>
              {showVarMenu && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                    Click to insert at cursor
                  </p>
                  <ul className="max-h-48 overflow-y-auto">
                    {MERGE_VARIABLE_OPTIONS.map((v) => (
                      <li key={v.token}>
                        <button
                          type="button"
                          onClick={() => {
                            // Insert into subject field as a fallback (editor handles its own insertion)
                            const token = `{{${v.token}}}`;
                            // Try to append to subject if nothing else is focused
                            setShowVarMenu(false);
                            // Note: For body, we rely on the Tiptap editor's own insert mechanism
                            // We just copy the token to clipboard as a convenience
                            navigator.clipboard?.writeText(token).catch(() => {});
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-700">{v.label}</span>
                          <code className="text-indigo-600 bg-indigo-50 px-1 rounded text-xs">
                            {`{{${v.token}}}`}
                          </code>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To (Email) *</label>
                <input
                  type="email"
                  {...register("to_email", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="professor@university.edu"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  {...register("to_name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Prof. Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
              <input
                type="text"
                {...register("subject", { required: true })}
                onBlur={applyMergeToForm}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="PhD Application Inquiry – {{program_name}} at {{university_name}}"
              />
              {errors.subject && <p className="text-xs text-red-500 mt-0.5">Subject is required</p>}
            </div>

            <div className="flex flex-col flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
              <Controller
                name="body_text"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <Controller
                    name="body_html"
                    control={control}
                    render={({ field: { onChange: onHtmlChange, value: htmlValue } }) => (
                      <TiptapEditor
                        value={htmlValue || value || ""}
                        onChange={(html, text) => {
                          onHtmlChange(html);
                          onChange(text);
                        }}
                        placeholder="Write your email… Use {{supervisor_name}}, {{university_name}} etc."
                      />
                    )}
                  />
                )}
              />
              {errors.body_text && <p className="text-xs text-red-500 mt-0.5">Body is required</p>}
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Attachments</label>
              <div className="flex flex-col gap-2">
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 self-start"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  Attach Files
                </button>
                {attachments.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mt-2">
                    {attachments.map((att, i) => (
                      <li key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md text-xs border border-gray-200">
                        <FileIcon className="w-3 h-3 text-gray-500" />
                        <span className="truncate max-w-[150px]">{att.file.name}</span>
                        <span className="text-gray-400">({Math.round(att.file.size / 1024)}kb)</span>
                        <button type="button" onClick={() => removeAttachment(i)} className="ml-1 text-gray-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  {...register("follow_up_date")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Schedule Send */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Schedule Send (optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {scheduledFor && (
                  <p className="text-xs text-indigo-600 mt-0.5">
                    Will send at {new Date(scheduledFor).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {/* Merge variable hint */}
            {Object.keys(defaultVars).length > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-md px-3 py-2 text-xs text-indigo-700">
                <strong>Mail Merge:</strong> Variables like <code className="bg-white px-1 rounded">{"{{supervisor_name}}"}</code> will be replaced automatically before sending.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 shrink-0 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              {sending ? "Sending…" : scheduledFor ? "Schedule Email" : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
