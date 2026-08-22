"use client";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { ApplicationForm } from "@/components/modules/applications/ApplicationForm";
import type { ApplicationFormData } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewApplicationPage() {
  const router = useRouter();

  const handleSubmit = async (data: ApplicationFormData) => {
    const res = await fetch("/api/v1/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create application");
    const json = await res.json();
    router.push(`/applications/${json.data.id}`);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </Link>
      </div>
      <PageHeader title="New Application" />
      <ApplicationForm onSubmit={handleSubmit} />
    </div>
  );
}
