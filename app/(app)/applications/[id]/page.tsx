"use client";
import { use } from "react";
import { useApplication } from "@/hooks/useApplication";
import { ApplicationDetail } from "@/components/modules/applications/ApplicationDetail";
import { Loader2 } from "lucide-react";

export default function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { application, isLoading, error, mutate } = useApplication(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        Application not found or failed to load.
      </div>
    );
  }

  return <ApplicationDetail application={application} mutate={mutate} />;
}
