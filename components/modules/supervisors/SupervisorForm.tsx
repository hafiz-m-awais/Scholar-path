"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Supervisor } from "@/lib/types";
import { useState } from "react";
import { Loader2, X } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Required"),
  university_name: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  google_scholar_url: z.string().url().optional().or(z.literal("")),
  lab_url: z.string().url().optional().or(z.literal("")),
  contact_status: z.enum(["not_contacted","email_sent","awaiting_response","replied","interested","meeting_scheduled","no_response"]).default("not_contacted"),
  research_interests_input: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SupervisorFormProps {
  defaultValues?: Partial<Supervisor>;
  onSubmit: (data: object) => Promise<void>;
}

export function SupervisorForm({ defaultValues, onSubmit }: SupervisorFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>(defaultValues?.research_interests ?? []);
  const [interestInput, setInterestInput] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      contact_status: "not_contacted" as const,
      ...Object.fromEntries(
        Object.entries(defaultValues ?? {}).map(([k, v]) => [k, v ?? undefined])
      ),
    } as FormData,
  });

  const addInterest = () => {
    const val = interestInput.trim();
    if (val && !interests.includes(val)) {
      setInterests((prev) => [...prev, val]);
    }
    setInterestInput("");
  };

  const removeInterest = (i: string) => setInterests((prev) => prev.filter((x) => x !== i));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmitHandler = async (data: any) => {
    setSubmitting(true);
    setError(null);
    try {
      const { research_interests_input, ...rest } = data;
      await onSubmit({ ...rest, research_interests: interests });
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
          <input type="text" {...register("name")} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
          <input type="text" {...register("university_name")} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input type="text" {...register("department")} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" {...register("email")} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
          <input type="url" {...register("website_url")} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Scholar URL</label>
          <input type="url" {...register("google_scholar_url")} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lab URL</label>
          <input type="url" {...register("lab_url")} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Status</label>
          <select {...register("contact_status")} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="not_contacted">Not Contacted</option>
            <option value="email_sent">Email Sent</option>
            <option value="awaiting_response">Awaiting Response</option>
            <option value="replied">Replied</option>
            <option value="interested">Interested</option>
            <option value="meeting_scheduled">Meeting Scheduled</option>
            <option value="no_response">No Response</option>
          </select>
        </div>
      </div>

      {/* Research Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Research Interests</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
            placeholder="Type and press Enter"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="button" onClick={addInterest} className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">Add</button>
        </div>
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {interests.map((ri) => (
              <span key={ri} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                {ri}
                <button type="button" onClick={() => removeInterest(ri)} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea {...register("notes")} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {defaultValues?.id ? "Save Changes" : "Add Supervisor"}
        </button>
      </div>
    </form>
  );
}
