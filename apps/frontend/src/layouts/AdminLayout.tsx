import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/auth.slice";

export function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark] = useState(true);

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
    { label: "Admin Console", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Back to App", path: "/dashboard", icon: ShieldCheck },
  ];

  return (
    <div className={`min-h-screen flex bg-[#070913] text-slate-100 transition-colors duration-205`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r transition-transform duration-300 lg:static lg:translate-x-0 bg-[#0b0f19] border-slate-850 shadow-2xl shadow-black/50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-850">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 text-white shadow-md shadow-rose-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-amber-400 bg-clip-text text-transparent">
              Admin Portal
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System Control
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-rose-600/15 to-amber-600/5 text-rose-400 border-l-[3px] border-rose-500 pl-2.5 rounded-l-none"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#11172a]/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-rose-450" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
              {user?.fullName?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-white">{user?.fullName || "Admin"}</p>
              <p className="text-[10px] text-rose-450 uppercase tracking-wider font-mono">SYSADMIN</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 backdrop-blur-md bg-[#070913]/75 border-slate-850">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold tracking-tight text-slate-400 hidden sm:block">
              {location.pathname.includes("dashboard") ? "Dashboard Console" : "System Control"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-[#0c1022]/40 text-[9px] font-mono font-bold tracking-wider text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>SECURE ADMIN SESSION</span>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#070913]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
