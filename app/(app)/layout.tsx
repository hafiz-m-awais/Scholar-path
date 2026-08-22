"use client";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopBar } from "@/components/shared/TopBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { NotificationManager } from "@/components/shared/NotificationManager";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils/cn";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-200",
          sidebarOpen ? "lg:pl-56" : "lg:pl-14"
        )}
      >
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
      <ConfirmDialog />
      <CommandPalette />
      <NotificationManager />
    </div>
  );
}
