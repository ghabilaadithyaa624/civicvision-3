import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/modules/auth/pages/ProtectedRoute";
import { AdminRoute } from "@/modules/auth/pages/AdminRoute";
import { FieldWorkerRoute } from "@/modules/auth/pages/FieldWorkerRoute";
import { AdminLayout } from "@/layouts/AdminLayout";
import { PageLoader } from "@/components/PageLoader";

/**
 * Route-level code splitting.
 *
 * Previously every page was imported eagerly at the top of this file,
 * so visiting "/" downloaded the JS for the dashboard, map, analytics,
 * observability, notifications, and profile pages too — before any of
 * them were needed. Each route now gets its own chunk, only fetched
 * when the user actually navigates there.
 *
 * `lazy()` requires a default export; these pages use named exports,
 * so each loader re-maps `{ default: module.PageName }`.
 */
function lazyNamed<T extends ComponentType>(
  factory: () => Promise<Record<string, T>>,
  exportName: string,
) {
  return lazy(() => factory().then((module) => ({ default: module[exportName] })));
}

const HomePage = lazyNamed(() => import("./HomePage"), "HomePage");
const LoginPage = lazyNamed(() => import("@/modules/auth/pages/LoginPage"), "LoginPage");
const RegisterPage = lazyNamed(() => import("@/modules/auth/pages/RegisterPage"), "RegisterPage");
const DashboardPage = lazyNamed(() => import("./DashboardPage"), "DashboardPage");
const MapPage = lazyNamed(() => import("@/modules/issues/pages/MapPage"), "MapPage");
const IssueListPage = lazyNamed(
  () => import("@/modules/issues/pages/IssueListPage"),
  "IssueListPage",
);
const ReportIssuePage = lazyNamed(
  () => import("@/modules/issues/pages/ReportIssuePage"),
  "ReportIssuePage",
);
const IssueDetailPage = lazyNamed(
  () => import("@/modules/issues/pages/IssueDetailPage"),
  "IssueDetailPage",
);
const AnalyticsPage = lazyNamed(
  () => import("@/modules/issues/pages/AnalyticsPage"),
  "AnalyticsPage",
);
const ObservabilityPage = lazyNamed(() => import("./ObservabilityPage"), "ObservabilityPage");
const NotificationsPage = lazyNamed(
  () => import("@/modules/issues/pages/NotificationsPage"),
  "NotificationsPage",
);
const ProfilePage = lazyNamed(() => import("@/modules/auth/pages/ProfilePage"), "ProfilePage");

const AdminLoginPage = lazyNamed(
  () => import("@/modules/admin/pages/AdminLoginPage"),
  "AdminLoginPage"
);
const AdminDashboardPage = lazyNamed(
  () => import("@/modules/admin/pages/AdminDashboardPage"),
  "AdminDashboardPage"
);
const FieldWorkerDashboard = lazyNamed(
  () => import("@/modules/fieldworker/pages/FieldWorkerDashboard"),
  "FieldWorkerDashboard"
);

/** Wraps a lazy page with the shared loading fallback, so each route doesn't repeat it. */
function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: "login", element: withSuspense(<LoginPage />) },
      { path: "register", element: withSuspense(<RegisterPage />) },
      { path: "admin-portal", element: withSuspense(<AdminLoginPage />) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "dashboard", element: withSuspense(<DashboardPage />) },
          { path: "map", element: withSuspense(<MapPage />) },
          { path: "issues", element: withSuspense(<IssueListPage />) },
          { path: "issues/report", element: withSuspense(<ReportIssuePage />) },
          { path: "issues/:id", element: withSuspense(<IssueDetailPage />) },
          { path: "analytics", element: withSuspense(<AnalyticsPage />) },
          { path: "observability", element: withSuspense(<ObservabilityPage />) },
          { path: "notifications", element: withSuspense(<NotificationsPage />) },
          { path: "profile", element: withSuspense(<ProfilePage />) },
        ],
      },
      {
        element: <FieldWorkerRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: "field-worker/dashboard", element: withSuspense(<FieldWorkerDashboard />) },
            ],
          },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: "admin/dashboard", element: withSuspense(<AdminDashboardPage />) },
            ],
          },
        ],
      },
    ],
  },
]);
