import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/auth.slice";
import { useCurrentUserQuery } from "../hooks/useAuth.hooks";
import { User, Shield, Mail, Calendar, Key, Check, Sparkles, Globe, RefreshCw } from "lucide-react";
import { Button } from "@civicvision/shared-ui";
import { LottieWidget } from "@/components/LottieWidget";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const storedUser = useAppSelector((state) => state.auth.user);
  const tokens = useAppSelector((state) => state.auth.tokens);
  const { data: freshUser, isLoading } = useCurrentUserQuery(Boolean(storedUser));
  const user = freshUser ?? storedUser;

  const [aiAutoTriage, setAiAutoTriage] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [saved, setSaved] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  async function handleRoleChange(newRole: "CITIZEN" | "FIELD_AGENT" | "ADMIN") {
    if (!user || !tokens) return;
    setUpdatingRole(newRole);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/auth/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          dispatch(setCredentials({
            user: body.data.user,
            tokens: body.data.tokens,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to swap user role:", err);
    } finally {
      setUpdatingRole(null);
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 text-white border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shrink-0 border-4 border-slate-800/80">
          {user?.fullName?.charAt(0) || "U"}
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight">{user?.fullName || "User Account"}</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1">
              <Shield className="h-3 w-3" /> {user?.role || "CITIZEN"}
            </span>
          </div>

          <p className="text-sm text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="h-4 w-4 text-slate-400" /> {user?.email || "user@civicvision.ai"}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-brand-400" /> Joined: {new Date().toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Key className="h-3.5 w-3.5 text-brand-400" /> UID: #{user?.id?.slice(0, 8) || "8f9a2b1c"}
            </span>
          </div>
        </div>

        <div className="self-center sm:self-start">
          <LottieWidget theme="success-check" width={50} height={50} />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left 2 Columns: Preferences & Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur-md space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <User className="h-5 w-5 text-brand-400" />
              <h2 className="text-base font-extrabold text-white">Account Settings & Preferences</h2>
            </div>

            {isLoading ? (
              <p className="text-xs text-slate-500">Loading user preferences...</p>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.fullName || ""}
                    disabled
                    className="w-full rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-500">Contact municipal IT support to update legal name.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                    className="w-full rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="border-t border-slate-800/80 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-400" /> AI & Telemetry Settings
                  </h3>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div>
                      <p className="text-xs font-bold text-white">AI Auto-Triage & Vision Analysis</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Allow Antigravity 3.5 Flash High to automatically grade severity on your uploaded photos.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiAutoTriage}
                      onChange={(e) => setAiAutoTriage(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div>
                      <p className="text-xs font-bold text-white">Email Notification Alerts</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Receive instant status updates when a municipal crew resolves your reported issue.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={(e) => setEmailNotifs(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  {saved && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check className="h-4 w-4" /> Preferences saved!
                    </span>
                  )}
                  <Button onClick={handleSave} className="bg-brand-500 hover:bg-brand-600 text-white text-xs py-2 px-5 rounded-xl">
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Role Access & Permissions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur-md space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Shield className="h-4 w-4 text-brand-400" />
              <h2 className="text-sm font-extrabold text-white">Role Swapper Console</h2>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Select an identity context below. This overrides your claims in the database and broadcasts new session tokens.
            </p>

            <div className="space-y-2.5">
              {(["CITIZEN", "FIELD_AGENT", "ADMIN"] as const).map((r) => {
                const isActive = user?.role === r;
                return (
                  <button
                    key={r}
                    disabled={updatingRole !== null}
                    onClick={() => handleRoleChange(r)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${
                      isActive
                        ? "bg-brand-500/10 border-brand-500/50 text-brand-300 shadow-md"
                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider">{r}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {r === "ADMIN"
                          ? "Global control tier"
                          : r === "FIELD_AGENT"
                            ? "Field response access"
                            : "Public citizen access"}
                      </p>
                    </div>
                    {updatingRole === r ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-400 shrink-0" />
                    ) : isActive ? (
                      <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800/85">
              <p className="font-semibold text-white text-[11px] uppercase tracking-wider text-slate-500">Live Permissions</p>
              <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> <span>Report Road & Civic Damage</span></div>
              <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> <span>AI Vision Triage Access</span></div>
              <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> <span>Live Tactical Map Telemetry</span></div>
              {user?.role !== "CITIZEN" && (
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-400" /> <span>Municipal Status Override</span></div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Globe className="h-4 w-4 text-brand-400" /> Regional Node
            </div>
            <p className="text-xs text-slate-300">
              Connected to <span className="font-mono text-brand-400 font-bold">US-EAST (Virginia)</span> municipal data cluster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
