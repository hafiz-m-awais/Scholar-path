"use client";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function SecuritySettingsPage() {
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (!user?.email) {
      setError("Unable to determine your account email. Please re-login.");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();

      // Re-verify identity with the current password before allowing a change.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        throw new Error("Current password is incorrect.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Settings
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Security</h1>
      <p className="text-sm text-gray-500 mb-6">Change your account password.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            Password updated successfully.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
