"use client";
import { use } from "react";
import { useApplication } from "@/hooks/useApplication";
import { ApplicationForm } from "@/components/modules/applications/ApplicationForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { application, isLoading } = useApplication(id);
  const router = useRouter();

  const handleSubmit = async (data: object) => {
    const res = await fetch(`/api/v1/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update application");
    router.push(`/applications/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link
          href={`/applications/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Application
        </Link>
      </div>
      <PageHeader title="Edit Application" />
      {application && (
        <ApplicationForm onSubmit={handleSubmit} defaultValues={application} />
      )}
    </div>
  );
}
