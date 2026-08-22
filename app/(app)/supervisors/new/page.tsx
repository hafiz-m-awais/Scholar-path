"use client";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupervisorForm } from "@/components/modules/supervisors/SupervisorForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewSupervisorPage() {
  const router = useRouter();

  const handleSubmit = async (data: object) => {
    const res = await fetch("/api/v1/supervisors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create supervisor");
    const json = await res.json();
    router.push(`/supervisors/${json.data.id}`);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link href="/supervisors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Back to Supervisors
        </Link>
      </div>
      <PageHeader title="Add Supervisor" />
      <SupervisorForm onSubmit={handleSubmit} />
    </div>
  );
}
