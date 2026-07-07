import { useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Sparkles, Clock, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@civicvision/shared-ui";
import { LottieWidget } from "@/components/LottieWidget";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "AI_DETECTION" | "STATUS_UPDATE" | "SYSTEM_ALERT" | "RESOLUTION";
  read: boolean;
  confidence?: number;
  location?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "AI Auto-Triaged Pothole Severity",
    description: "High severity pothole detected at 5th Ave intersection via uploaded image analysis. Priority bumped to Critical.",
    timestamp: "2 minutes ago",
    type: "AI_DETECTION",
    read: false,
    confidence: 0.94,
    location: "Sector 4, Main Blvd",
  },
  {
    id: "notif-2",
    title: "Water Leakage Dispatched",
    description: "Municipal Emergency Water Crew #04 has been dispatched to resolve issue #wl-8921.",
    timestamp: "1 hour ago",
    type: "STATUS_UPDATE",
    read: false,
    location: "Sector 2, Oak St",
  },
  {
    id: "notif-3",
    title: "Streetlight Issue Resolved",
    description: "Issue #sl-4410 verified by automated nighttime telemetry sensor and marked as Resolved.",
    timestamp: "3 hours ago",
    type: "RESOLUTION",
    read: true,
    location: "Sector 1, Park Ave",
  },
  {
    id: "notif-4",
    title: "City Infrastructure Maintenance Window",
    description: "Scheduled database synchronization and AI model weight pruning tonight at 03:00 UTC.",
    timestamp: "Yesterday",
    type: "SYSTEM_ALERT",
    read: true,
  },
  {
    id: "notif-5",
    title: "Garbage Overflow Detected",
    description: "AI vision sensor flagged uncollected waste overflow near Central Transit Hub.",
    timestamp: "2 days ago",
    type: "AI_DETECTION",
    read: true,
    confidence: 0.89,
    location: "Central District",
  },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<string>("ALL");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "AI") return n.type === "AI_DETECTION";
    if (filter === "STATUS") return n.type === "STATUS_UPDATE" || n.type === "RESOLUTION";
    return true;
  });

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Bell className="h-6 w-6 text-brand-400 animate-bounce" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              Notifications & AI Alert Feed
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-500 text-white">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Real-time telemetry alerts, automated triage updates, and municipal dispatch notices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {unreadCount > 0 && (
            <Button
              onClick={markAllRead}
              variant="ghost"
              className="text-xs text-slate-300 hover:text-white border-slate-700 py-1.5"
            >
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              onClick={clearAll}
              variant="ghost"
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30 py-1.5 flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
        {[
          { label: "All Alerts", id: "ALL" },
          { label: "Unread Only", id: "UNREAD" },
          { label: "AI Detections", id: "AI" },
          { label: "Status & Resolutions", id: "STATUS" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === tab.id
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-800 bg-[#0f172a]/50 text-center p-6">
            <div className="w-16 h-16 mb-4">
              <LottieWidget theme="empty-box" width={64} height={64} />
            </div>
            <h3 className="text-sm font-bold text-white">No notifications found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              You're all caught up! There are no new alerts matching your selected filter.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const isAI = item.type === "AI_DETECTION";
            const isSuccess = item.type === "RESOLUTION";
            const isAlert = item.type === "SYSTEM_ALERT";

            return (
              <div
                key={item.id}
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                  );
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  !item.read
                    ? "bg-[#0f172a] border-brand-500/40 shadow-lg shadow-brand-500/5"
                    : "bg-[#0f172a]/60 border-slate-800/80 opacity-80 hover:opacity-100"
                }`}
              >
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    isAI
                      ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                      : isSuccess
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : isAlert
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {isAI ? (
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isAlert ? (
                    <ShieldAlert className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                      {!item.read && (
                        <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>

                  {(item.location || item.confidence) && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                      {item.location && <span>📍 {item.location}</span>}
                      {item.confidence && (
                        <span className="text-brand-400 font-bold flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> AI Confidence: {Math.round(item.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
