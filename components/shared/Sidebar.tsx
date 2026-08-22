"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileText,
  CheckSquare,
  Mail,
  SendHorizontal,
  Globe,
  Settings,
  LogOut,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: GraduationCap },
  { href: "/supervisors", label: "Supervisors", icon: Users },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/emails", label: "Emails", icon: Mail },
  { href: "/submissions", label: "Submissions", icon: SendHorizontal },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-gray-900 text-white z-30 flex flex-col transition-all duration-200",
          sidebarOpen ? "w-56" : "w-0 lg:w-14 overflow-hidden"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
          <BookOpen className="w-6 h-6 text-indigo-400 shrink-0" />
          {sidebarOpen && (
            <span className="font-bold text-sm tracking-wide text-white">
              ScholarPath
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-indigo-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                    title={!sidebarOpen ? label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {sidebarOpen && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="py-4 border-t border-gray-700 px-2 space-y-0.5">
          {bottomItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            title={!sidebarOpen ? "Sign out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
