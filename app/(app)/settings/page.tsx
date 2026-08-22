"use client";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSettings } from "@/hooks/useSettings";
import { Settings, Mail, Download, Shield, Bell, User } from "lucide-react";

const settingsItems = [
  { href: "/settings/profile", label: "Profile", description: "Update your personal details and photo", icon: User },
  { href: "/settings/email", label: "Email / Gmail", description: "Connect your Gmail account to send emails", icon: Mail },
  { href: "/settings/notifications", label: "Notifications", description: "Configure deadline reminder preferences", icon: Bell },
  { href: "/settings/export", label: "Export Data", description: "Download all your data as a JSON file", icon: Download },
  { href: "/settings/security", label: "Security", description: "Change your password", icon: Shield },
];

export default function SettingsPage() {
  const { settings } = useSettings();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="App configuration and preferences" />

      <div className="space-y-2">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {settings && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Account</h3>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{settings.display_name ?? "PhD Applicant"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
