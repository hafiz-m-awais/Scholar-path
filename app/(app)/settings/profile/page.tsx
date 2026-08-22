"use client";
import { useState, useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader2, User, Camera } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { settings, mutate: mutateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setEmail(user.email ?? "");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        setDisplayName(user.user_metadata?.full_name || settings?.display_name || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, [settings]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();

    try {
      // 1. Update Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: displayName,
          avatar_url: avatarUrl,
        }
      });
      if (authError) throw authError;

      // 2. Update user_settings if it exists
      if (settings?.id) {
        const { error: dbError } = await supabase
          .from("user_settings")
          .update({ display_name: displayName })
          .eq("id", settings.id);
        if (dbError) throw dbError;
        mutateSettings();
      }

      setMessage({ type: "success", text: "Profile updated successfully. Refresh to see changes globally." });
      
      // dispatch a custom event to force TopBar update if needed
      window.dispatchEvent(new Event("profile-updated"));
      
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader 
        title="Profile Settings" 
        description="Update your personal details and photo" 
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          
          {/* Avatar Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Profile Photo</label>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended size: 256x256px.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Your email address cannot be changed here.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
