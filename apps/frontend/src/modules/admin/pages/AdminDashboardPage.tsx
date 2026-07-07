import { useState } from "react";
import {
  Users,
  Shield,
  UserCheck,
  Search,
  Settings,
  CircleDot,
  RefreshCw,
  Trash2,
  Lock,
} from "lucide-react";
import {
  useAllUsersQuery,
  useUpdateUserRoleMutation,
  useToggleUserActiveMutation,
} from "../hooks/useAdmin.hooks";
import { useIssuesQuery, useDeleteIssueMutation } from "@/modules/issues/hooks/useIssues.hooks";
import type { UserRole } from "@civicvision/shared-types";

export function AdminDashboardPage() {
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAllUsersQuery();
  const { data: issues, isLoading: issuesLoading, refetch: refetchIssues } = useIssuesQuery();

  const updateRoleMutation = useUpdateUserRoleMutation();
  const toggleActiveMutation = useToggleUserActiveMutation();
  const deleteIssueMutation = useDeleteIssueMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "issues">("users");

  // Statistics
  const totalUsers = users?.length || 0;
  const totalCitizens = users?.filter((u) => u.role === "CITIZEN").length || 0;
  const totalAgents = users?.filter((u) => u.role === "FIELD_AGENT").length || 0;
  const totalAdmins = users?.filter((u) => u.role === "ADMIN").length || 0;

  const totalIssues = issues?.length || 0;

  // Filtered lists
  const filteredUsers = users?.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIssues = issues?.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id: userId, isActive: !currentStatus });
  };

  const handleDeleteIssue = (issueId: string) => {
    if (confirm("Are you sure you want to permanently delete this issue report?")) {
      deleteIssueMutation.mutate(issueId);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      {/* HEADER banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-rose-950/20 to-slate-950 p-8 border border-slate-800/60 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold mb-4">
              <Shield className="h-3.5 w-3.5" />
              <span>Root Administrator Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              System Administration
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-lg">
              Manage system access permissions, oversee active user accounts, and moderate civic issue reports.
            </p>
          </div>
          <button
            onClick={() => {
              refetchUsers();
              refetchIssues();
            }}
            className="flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-bold text-slate-350 hover:text-white bg-[#0f172a] border border-slate-850 hover:border-slate-700 rounded-xl transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Accounts */}
        <div className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Accounts</p>
            <p className="text-2xl font-extrabold text-white">{usersLoading ? "..." : totalUsers}</p>
          </div>
        </div>

        {/* Citizens */}
        <div className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Citizens</p>
            <p className="text-2xl font-extrabold text-white">{usersLoading ? "..." : totalCitizens}</p>
          </div>
        </div>

        {/* Field Workers */}
        <div className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Field Agents</p>
            <p className="text-2xl font-extrabold text-white">{usersLoading ? "..." : totalAgents}</p>
          </div>
        </div>

        {/* Admins */}
        <div className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Admins</p>
            <p className="text-2xl font-extrabold text-white">{usersLoading ? "..." : totalAdmins}</p>
          </div>
        </div>
      </div>

      {/* TABS & SEARCH CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/30 border border-slate-850 rounded-2xl p-3">
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              setActiveTab("users");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "users" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            User Accounts ({totalUsers})
          </button>
          <button
            onClick={() => {
              setActiveTab("issues");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "issues" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Reports Database ({totalIssues})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder={activeTab === "users" ? "Search email, name or role..." : "Search title, status..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#05070e] border border-slate-800 focus:border-rose-500 focus:ring-rose-500/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-650 outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
        </div>
      </div>

      {/* CONTENT PANEL */}
      {activeTab === "users" ? (
        <div className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-900/30 text-slate-450 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50 text-xs">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500 font-semibold">
                      Loading user database...
                    </td>
                  </tr>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-200">{user.fullName}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="bg-slate-950 border border-slate-800 text-[11px] rounded-lg px-2.5 py-1 text-slate-300 font-bold focus:border-rose-500 outline-none cursor-pointer"
                        >
                          <option value="CITIZEN">Citizen</option>
                          <option value="FIELD_AGENT">Field Agent</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            user.isActive
                              ? "text-emerald-450 bg-emerald-500/10 border-emerald-500/20"
                              : "text-rose-455 bg-rose-500/10 border-rose-500/20"
                          }`}
                        >
                          <CircleDot className="h-2 w-2 animate-pulse" />
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            user.isActive
                              ? "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20"
                              : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      No accounts matched the query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-850 bg-[#0f172a]/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-900/30 text-slate-450 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Report</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50 text-xs">
                {issuesLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500 font-semibold">
                      Loading issues database...
                    </td>
                  </tr>
                ) : filteredIssues && filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-200">{issue.title}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{issue.description || "No description provided"}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-350">{issue.category}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            issue.status === "RESOLVED"
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              : issue.status === "PENDING"
                                ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                : issue.status === "IN_PROGRESS"
                                  ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                                  : "text-rose-455 bg-rose-500/10 border-rose-500/20"
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteIssue(issue.id)}
                          className="p-2 text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete issue permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      No reports match search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
