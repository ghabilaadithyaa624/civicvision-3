import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function ProtectedRoute() {
  const tokens = useAppSelector((state) => state.auth.tokens);

  if (!tokens) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
