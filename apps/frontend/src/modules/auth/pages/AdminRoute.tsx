import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function AdminRoute() {
  const user = useAppSelector((state) => state.auth.user);
  const tokens = useAppSelector((state) => state.auth.tokens);

  if (!tokens) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
