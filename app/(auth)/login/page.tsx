"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { BookOpen, Loader2, GraduationCap } from "lucide-react";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      // Use hard navigation to prevent Next.js router from hanging during auth state transitions
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || email.split("@")[0] },
        },
      });
      if (error) { setError(error.message); return; }
      setSuccess("Account created! You can now sign in.");
      setMode("login");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ScholarPath</h1>
            <p className="text-xs text-indigo-300/70">Your PhD Application Command Center</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
          {/* Tabs */}
          <div className="flex rounded-lg bg-white/5 p-1 mb-6 gap-1">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 capitalize ${
                  mode === m
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {success && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Email" id="email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              <Field label="Password" id="password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
              <SubmitButton loading={loading} label="Sign In" loadingLabel="Signing in…" />
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="Display Name" id="display_name" type="text" value={displayName} onChange={setDisplayName} placeholder="e.g. Awais" />
              <Field label="Email" id="reg-email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              <Field label="Password" id="reg-password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" autoComplete="new-password" />
              <Field label="Confirm Password" id="confirm-password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" autoComplete="new-password" />
              <SubmitButton loading={loading} label="Create Account" loadingLabel="Creating account…" />
            </form>
          )}
        </div>

        <p className="text-center text-xs text-white/30 mt-4">
          Your data is private and secured by Row Level Security.
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function Field({
  label, id, type, value, onChange, placeholder, autoComplete,
}: {
  label: string; id: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-white/60 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 mt-2"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? loadingLabel : label}
    </button>
  );
}
