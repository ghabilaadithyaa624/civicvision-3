import { Link, Outlet, useNavigate } from "react-router-dom";
import { ShieldCheck, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/auth.slice";
import { Button } from "@civicvision/shared-ui";

export function RootLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
            <ShieldCheck className="h-6 w-6 text-brand-600" />
            CivicVision AI
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
                  Dashboard
                </Link>
                <span className="text-sm text-slate-500">{user.fullName}</span>
                <Button variant="ghost" onClick={handleLogout} className="gap-1.5">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button variant="primary">Get started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        CivicVision AI — AI-powered civic infrastructure platform
      </footer>
    </div>
  );
}
