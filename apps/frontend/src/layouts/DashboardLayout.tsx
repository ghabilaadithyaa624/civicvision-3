import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  ListFilter,
  BarChart3,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  Globe,
  Menu,
  X,
  ChevronDown,
  Check,
  Sparkles,
  MessageSquare,
  Send,
  Plus,
  Hammer,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/auth.slice";
import { Button } from "@civicvision/shared-ui";
import { LottieWidget } from "@/components/LottieWidget";
import { useSaaSSimulator } from "@/hooks/useSaaSSimulator";

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "EN", label: "English", flag: "🇺🇸" },
  { code: "ES", label: "Español", flag: "🇪🇸" },
  { code: "FR", label: "Français", flag: "🇫🇷" },
  { code: "HI", label: "हिन्दी", flag: "🇮🇳" },
  { code: "JA", label: "日本語", flag: "🇯🇵" },
];

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export function DashboardLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const { state: saasState, isOffline, isRealtime, setSaaSState, setOffline, setRealtime } = useSaaSSimulator();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Floating AI Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hello! I am your AI Civic Assistant. How can I help you today?", timestamp: "Just now" },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize Obsidian Dark Mode by default
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Map", path: "/map", icon: MapPin },
    { label: "My Reports", path: "/issues?filter=my", icon: ListFilter, matchPath: "/issues" },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    ...(user?.role === "FIELD_AGENT" || user?.role === "ADMIN"
      ? [{ label: "Field Worker", path: "/field-worker/dashboard", icon: Hammer }]
      : []),
    ...(user?.role === "ADMIN"
      ? [{ label: "Admin Console", path: "/admin/dashboard", icon: ShieldCheck }]
      : []),
    { label: "Observability", path: "/observability", icon: ShieldCheck },
    { label: "Notifications", path: "/notifications", icon: Bell, badge: 3 },
    { label: "Profile", path: "/profile", icon: User },
  ];

  const recentAlerts = [
    {
      id: 1,
      title: "AI Detected Pothole",
      time: "2 mins ago",
      desc: "5th Ave intersection — 94% confidence score.",
    },
    {
      id: 2,
      title: "Water Leakage In Progress",
      time: "1 hour ago",
      desc: "Municipal crew dispatched to Sector 4.",
    },
    {
      id: 3,
      title: "Streetlight Resolved",
      time: "3 hours ago",
      desc: "Issue #a8f92b verified and closed.",
    },
  ];

  const triggerChatChoice = (choice: string) => {
    // Append user message
    const userMsg: ChatMessage = { sender: "user", text: choice, timestamp: "Just now" };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    let aiText = "";
    if (choice.includes("Track")) {
      aiText = "Enter your tracking ID (e.g. CV-2026-A8F9) in the profile page or search bar. Statuses are synchronized across Redis and PostgreSQL schemas.";
    } else if (choice.includes("Nearby")) {
      aiText = "I've scanned your local GIS node. There are 5 active infrastructure beacons within 500 meters of your coordinates.";
    } else if (choice.includes("Report")) {
      aiText = "Simply click 'Report Issue', select or take a photo, and our YOLOv11 pipeline will automatically classify the category and estimate repair costs.";
    } else {
      aiText = "Current city average resolution SLA is 1.8 Days. 94% of reported potholes are verified and auto-dispatched within 100 milliseconds.";
    }

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages((prev) => [...prev, { sender: "ai", text: aiText, timestamp: "Just now" }]);
    }, 1000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText, timestamp: "Just now" }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Understood! I've logged your request: "${userText}". Our staff and field crews have been notified. Let me know if you'd like to check Nearby Issues or Track a Report.`,
          timestamp: "Just now",
        },
      ]);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-[#090d16] text-slate-100" : "bg-slate-50 text-slate-900"} transition-colors duration-200`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r transition-transform duration-300 lg:static lg:translate-x-0 ${
          isDark
            ? "bg-[#0f172a]/95 border-slate-800/80 shadow-2xl shadow-black/50"
            : "bg-white border-slate-200 shadow-sm"
        } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-inherit">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-brand-500 to-sky-600 text-white shadow-md shadow-brand-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              CivicVision AI
            </span>
          </Link>
          <button
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.matchPath && location.pathname.startsWith(item.matchPath));

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? isDark
                      ? "bg-gradient-to-r from-brand-600/15 to-sky-600/5 text-brand-400 border-l-[3px] border-brand-500 pl-2.5 rounded-l-none"
                      : "bg-brand-50 text-brand-700 border-l-[3px] border-brand-500 pl-2.5 rounded-l-none"
                    : isDark
                      ? "text-slate-400 hover:text-slate-200 hover:bg-[#11172a]/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white shadow-sm shadow-brand-500/50">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI Core Status Banner with Lottie Widget */}
        <div className="p-4 m-3 rounded-2xl border border-slate-800/60 bg-gradient-to-b from-[#0b0f19] to-[#161a33]/40 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 shadow-inner">
              <LottieWidget theme="ai-pulse" width={32} height={32} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
                <p className="text-[11px] font-bold text-slate-200 truncate">AI Core v3.5 Flash</p>
              </div>
              <p className="text-[10px] text-cyan-400 font-bold font-mono mt-0.5 tracking-wider uppercase">High Precision Active</p>
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-inherit flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-inherit">{user?.fullName || "User"}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{user?.role || "CITIZEN"}</p>
            </div>
          </div>
          <button
            aria-label="Sign out"
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0">
        {/* Top Navbar */}
        <header
          className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 backdrop-blur-md transition-colors ${
            isDark
              ? "bg-[#090d16]/75 border-slate-800/80"
              : "bg-white/75 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold tracking-tight text-slate-450 hidden sm:block mr-2">
              {navItems.find((i) => location.pathname.startsWith(i.path) || (i.matchPath && location.pathname.startsWith(i.matchPath)))?.label || "Workspace"}
            </h2>

            {/* Presence HUD stack */}
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-800/85 pl-4 mr-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#090d16] bg-cyan-500 text-white text-[9px] font-extrabold flex items-center justify-center cursor-help shadow-sm" title="Sarah M. (Field Agent) - Active in Sector 4">SM</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#090d16] bg-emerald-500 text-white text-[9px] font-extrabold flex items-center justify-center cursor-help shadow-sm" title="John D. (Municipal Admin) - Online">JD</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#090d16] bg-purple-500 text-white text-[9px] font-extrabold flex items-center justify-center cursor-help shadow-sm" title="YOLOv11 Bot - Active in City Center">YB</div>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 font-bold ml-1 animate-pulse">● 3 COLLABORATORS</span>
            </div>
          </div>

          {/* Topbar Interactive Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-[#0c1022]/40 text-[9px] font-mono font-bold tracking-wider">
              {isOffline ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-amber-500">OFFLINE (QUEUE: {localStorage.getItem("offline_issues_queue") ? JSON.parse(localStorage.getItem("offline_issues_queue")!).length : 0})</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400">ONLINE (SYNCED)</span>
                </>
              )}
            </div>

            {/* Offline Simulation toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-[#0c1022]/40 text-[9px] font-mono font-bold tracking-wider">
              <span className="text-slate-400">Offline Simulation:</span>
              <button
                aria-label="Toggle offline simulation"
                onClick={() => setOffline(!isOffline)}
                className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer outline-none ${isOffline ? "bg-amber-500" : "bg-slate-800"}`}
              >
                <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${isOffline ? "right-0.5" : "left-0.5"}`} />
              </button>
            </div>
            {/* 🌐 Language Selector Dropdown */}
            <div className="relative">
              <button
                aria-label="Select language"
                aria-haspopup="true"
                aria-expanded={isLangOpen}
                onClick={() => {
                  setIsLangOpen(!isLangOpen);
                  setIsNotifOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                  isDark
                    ? "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-brand-400" />
                <span>{selectedLang.flag} {selectedLang.code}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {isLangOpen && (
                <div
                  className={`absolute right-0 mt-2 w-40 rounded-2xl border shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isDark ? "bg-[#0f172a] border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-inherit">
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-brand-500/10 hover:text-brand-400 transition-colors ${
                        selectedLang.code === lang.code ? "font-bold text-brand-400 bg-brand-500/5" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {selectedLang.code === lang.code && <Check className="h-3.5 w-3.5 text-brand-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 🌙 Dark Mode Toggle */}
            <button
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Obsidian Dark Mode"}
              onClick={() => setIsDark(!isDark)}
              title={isDark ? "Switch to Light Mode" : "Switch to Obsidian Dark Mode"}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                isDark
                  ? "bg-slate-800/60 border-slate-700/80 text-amber-400 hover:bg-slate-800 shadow-sm shadow-amber-400/10"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* 🔔 Notifications Bell Dropdown */}
            <div className="relative">
              <button
                aria-label="Toggle notifications"
                aria-haspopup="true"
                aria-expanded={isNotifOpen}
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsLangOpen(false);
                }}
                className={`relative p-2 rounded-xl border transition-colors ${
                  isDark
                    ? "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-extrabold text-white animate-pulse">
                  3
                </span>
              </button>

              {isNotifOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isDark ? "bg-[#0f172a] border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-inherit bg-slate-900/30">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-brand-400" />
                      <span className="text-xs font-bold">AI Detection Alerts</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400">
                      3 New
                    </span>
                  </div>

                  <div className="divide-y divide-inherit max-h-80 overflow-y-auto">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className="p-3.5 hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-inherit">{alert.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{alert.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-2 border-t border-inherit text-center bg-slate-900/40">
                    <Link
                      to="/notifications"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs font-semibold text-brand-400 hover:text-brand-300 block py-1"
                    >
                      View All Notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Report Button */}
            <Link to="/issues/report">
              <Button className="bg-gradient-to-r from-brand-500 to-sky-600 hover:from-brand-650 hover:to-sky-700 text-white border-none shadow-md shadow-brand-500/20 text-xs py-1.5 px-3 rounded-xl hidden sm:flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Report Issue</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* 📱 Responsive Mobile Bottom Navigation */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-40 backdrop-blur-md ${
        isDark ? "bg-[#0f172a]/95 border-slate-850" : "bg-white/95 border-slate-200"
      }`}>
        <Link to="/dashboard" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-brand-400">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-bold">Dashboard</span>
        </Link>
        <Link to="/map" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-brand-400">
          <MapPin className="h-5 w-5" />
          <span className="text-[9px] font-bold">Map</span>
        </Link>
        <Link to="/issues/report" className="flex flex-col items-center justify-center -translate-y-4">
          <div className="p-3.5 rounded-full bg-gradient-to-r from-brand-500 to-sky-600 text-white shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 transition-transform">
            <Plus className="h-5 w-5" />
          </div>
        </Link>
        <Link to="/notifications" className="relative flex flex-col items-center gap-0.5 text-slate-400 hover:text-brand-400">
          <Bell className="h-5 w-5" />
          <span className="text-[9px] font-bold">Alerts</span>
          <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-brand-500" />
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-brand-400">
          <User className="h-5 w-5" />
          <span className="text-[9px] font-bold">Profile</span>
        </Link>
      </div>

      {/* 🤖 Floating AI Chatbot Helper Widget */}
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end gap-3 pointer-events-none select-none">
        {isChatOpen && (
          <div className={`w-80 sm:w-96 rounded-2xl border shadow-2xl flex flex-col overflow-hidden pointer-events-auto backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            isDark ? "bg-[#0b0f19]/95 border-slate-800/85 text-slate-200" : "bg-white/95 border-slate-200 text-slate-805"
          }`}>
            {/* Chatbot Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#080b12] via-[#11162b] to-[#080b12] border-b border-slate-800/80 text-white">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-xl bg-brand-500/10 text-cyan-400 border border-brand-500/20">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold block tracking-tight">CivicVision AI Assistant</span>
                  <span className="text-[9px] text-cyan-400 font-bold font-mono flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" /> 3.5 FLASH ONLINE
                  </span>
                </div>
              </div>
              <button aria-label="Close chat" onClick={() => setIsChatOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="p-4 flex-1 h-64 overflow-y-auto space-y-3 scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-brand-600 to-indigo-650 text-white rounded-tr-none shadow-md shadow-brand-500/10"
                      : isDark
                        ? "bg-[#13172e]/70 text-slate-200 rounded-tl-none border border-slate-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
                        : "bg-slate-100 text-slate-800 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#13172e]/50 rounded-2xl rounded-tl-none px-4 py-2 border border-slate-800/50 flex items-center gap-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Helper Choice Prompts */}
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-slate-800/60 bg-slate-900/10">
              {["Track Report", "Nearby Issues", "Report Issue", "SLA Status"].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => triggerChatChoice(prompt)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                    isDark ? "bg-[#0b0f19] border-slate-800 hover:border-brand-500 text-slate-350" : "bg-slate-50 border-slate-200 hover:border-brand-500 text-slate-600"
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* SaaS Developer State Simulator Console */}
            <div className="px-4 py-3 border-t border-slate-800/60 bg-[#070913]/90 relative z-25">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                <Sparkles className="h-3 w-3 animate-spin-slow" /> SaaS Developer Simulator
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(["NORMAL", "LOADING", "EMPTY", "ERROR"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSaaSState(s)}
                    className={`px-1.5 py-1 text-[8px] font-bold font-mono border rounded cursor-pointer transition-all ${
                      saasState === s
                        ? "bg-brand-500/20 border-brand-500 text-brand-400"
                        : "bg-[#11172a] border-slate-800/65 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[8px] font-mono">
                <button
                  type="button"
                  onClick={() => setOffline(!isOffline)}
                  className={`flex-1 mr-1 px-1.5 py-1 rounded border text-center transition-all cursor-pointer ${
                    isOffline ? "bg-amber-500/20 border-amber-500 text-amber-405 font-bold" : "bg-[#11172a] border-slate-800/65 text-slate-500"
                  }`}
                >
                  {isOffline ? "● OFFLINE" : "○ ONLINE"}
                </button>
                <button
                  type="button"
                  onClick={() => setRealtime(!isRealtime)}
                  className={`flex-1 ml-1 px-1.5 py-1 rounded border text-center transition-all cursor-pointer ${
                    isRealtime ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold" : "bg-[#11172a] border-slate-800/65 text-slate-500"
                  }`}
                >
                  {isRealtime ? "● REALTIME ON" : "○ REALTIME OFF"}
                </button>
              </div>
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800/60 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask something..."
                className={`flex-1 rounded-xl border px-3 py-2 text-xs outline-none focus:border-brand-500 ${
                  isDark ? "bg-[#05070e] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
              <button
                aria-label="Send message"
                type="submit"
                className="p-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-650 hover:to-cyan-600 text-white shadow-md shadow-brand-500/20 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Toggle Chat button */}
        <button
          aria-label="Toggle AI Chatbot Support"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="pointer-events-auto cursor-pointer w-12 h-12 rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(59,130,246,0.35)] hover:scale-105 hover:shadow-[0_4px_30px_rgba(59,130,246,0.6)] hover:border-cyan-400/50 transition-all border border-brand-500/40 animate-pulse-glowing"
          title="Toggle AI Chatbot Support"
        >
          {isChatOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
