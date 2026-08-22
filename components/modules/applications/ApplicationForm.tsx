"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Application, ApplicationFormData } from "@/lib/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const schema = z.object({
  university_name: z.string().min(1, "Required"),
  program_name: z.string().min(1, "Required"),
  department: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  degree_type: z.enum(["PhD", "MSc", "Other"]).default("PhD"),
  intake: z.string().optional(),
  application_deadline: z.string().optional(),
  scholarship_deadline: z.string().optional(),
  application_portal_url: z.string().url().optional().or(z.literal("")),
  university_url: z.string().url().optional().or(z.literal("")),
  application_fee: z.coerce.number().optional(),
  fee_currency: z.string().default("USD"),
  funding_type: z
    .enum(["fully_funded", "partially_funded", "self_funded", "unknown"])
    .default("unknown"),
  funding_notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z
    .enum([
      "researching",
      "preparing",
      "submitted",
      "interview",
      "accepted",
      "rejected",
      "withdrawn",
    ])
    .default("researching"),
  phd_description: z.string().optional(),
  notes: z.string().optional(),
});

interface ApplicationFormProps {
  defaultValues?: Partial<Application>;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
}

export function ApplicationForm({ defaultValues, onSubmit }: ApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      degree_type: "PhD" as const,
      funding_type: "unknown" as const,
      priority: "medium" as const,
      status: "researching" as const,
      fee_currency: "USD",
      ...Object.fromEntries(
        Object.entries(defaultValues ?? {}).map(([k, v]) => [k, v ?? undefined])
      ),
    } as ApplicationFormData,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmitHandler = async (data: any) => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (
    label: string,
    name: keyof ApplicationFormData,
    type = "text",
    required = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {errors[name] && (
        <p className="mt-1 text-xs text-red-600">{String(errors[name]?.message)}</p>
      )}
    </div>
  );

  const selectField = (
    label: string,
    name: keyof ApplicationFormData,
    options: { value: string; label: string }[]
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        {...register(name)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="bg-white rounded-lg border border-gray-200 p-6 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("University Name", "university_name", "text", true)}
        {field("Program Name", "program_name", "text", true)}
        {field("Department", "department")}
        {field("Country", "country")}
        {field("City", "city")}
        {field("Intake (e.g. Fall 2027)", "intake")}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {selectField("Degree Type", "degree_type", [
          { value: "PhD", label: "PhD" },
          { value: "MSc", label: "MSc" },
          { value: "Other", label: "Other" },
        ])}
        {selectField("Status", "status", [
          { value: "researching", label: "Researching" },
          { value: "preparing", label: "Preparing" },
          { value: "submitted", label: "Submitted" },
          { value: "interview", label: "Interview" },
          { value: "accepted", label: "Accepted" },
          { value: "rejected", label: "Rejected" },
          { value: "withdrawn", label: "Withdrawn" },
        ])}
        {selectField("Priority", "priority", [
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" },
        ])}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("Application Deadline", "application_deadline", "date")}
        {field("Scholarship Deadline", "scholarship_deadline", "date")}
      </div>

      {selectField("Funding Type", "funding_type", [
        { value: "fully_funded", label: "Fully Funded" },
        { value: "partially_funded", label: "Partially Funded" },
        { value: "self_funded", label: "Self Funded" },
        { value: "unknown", label: "Unknown" },
      ])}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("Application Portal URL", "application_portal_url", "url")}
        {field("University URL", "university_url", "url")}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field("Application Fee", "application_fee", "number")}
        {field("Fee Currency", "fee_currency")}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Funding Notes
        </label>
        <input
          type="text"
          {...register("funding_notes")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PhD Description (Research Proposal/Focus)
        </label>
        <textarea
          {...register("phd_description")}
          rows={4}
          placeholder="Briefly describe the proposed PhD research or topic for this application..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register("notes")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {defaultValues?.id ? "Save Changes" : "Create Application"}
        </button>
      </div>
    </form>
  );
}
