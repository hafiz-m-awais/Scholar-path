import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardClient } from "@/components/modules/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your PhD application command center"
      />
      <DashboardClient />
    </div>
  );
}
