"use client";
import { useEffect, useState } from "react";
import { Menu, Wifi, WifiOff, User, LogOut, Settings } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { toggleSidebar } = useUIStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  const loadProfile = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email ?? null);
      setAvatarUrl(user.user_metadata?.avatar_url || null);
      setDisplayName(user.user_metadata?.full_name || null);
    }
  };

  useEffect(() => {
    loadProfile();

    // Track online status
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    
    // Listen for custom profile update event
    window.addEventListener("profile-updated", loadProfile);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("profile-updated", loadProfile);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 gap-3 sticky top-0 z-10">
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {title && (
        <h1 className="text-sm font-semibold text-gray-700">{title}</h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Online / Offline badge */}
      <div
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          isOnline
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
        title={isOnline ? "Connected — data syncing to cloud" : "Offline — changes saved locally"}
      >
        {isOnline ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
      </div>

      {/* User Dropdown */}
      {userEmail && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 pl-1 pr-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0 border border-gray-300">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-gray-500" />
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate hidden sm:block">
                {displayName || userEmail.split("@")[0]}
              </span>
            </button>
          </DropdownMenu.Trigger>
          
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
              
              <DropdownMenu.Item asChild>
                <Link
                  href="/settings/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 outline-none cursor-pointer"
                >
                  <User className="w-4 h-4 shrink-0" />
                  Profile & Photo
                </Link>
              </DropdownMenu.Item>
              
              <DropdownMenu.Item asChild>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 outline-none cursor-pointer"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  Settings
                </Link>
              </DropdownMenu.Item>
              
              <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
              
              <DropdownMenu.Item
                onSelect={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 outline-none cursor-pointer font-medium"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </header>
  );
}
