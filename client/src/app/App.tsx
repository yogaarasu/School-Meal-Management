import { Navigate, Route, Routes } from "react-router-dom";
import { PublicOnlyRoute } from "@/components/guards/public-only-route";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { AdminLayout } from "@/components/layout/admin-layout";
import { OrganizerLayout } from "@/components/layout/organizer-layout";
import { AppProviders } from "@/app/providers";
import { LoginPage } from "@/modules/auth/components/login-page";
import { useAuth } from "@/modules/auth/context/auth-context";
import { AdminDashboardPage } from "@/modules/admin/pages/admin-dashboard-page";
import { OrganizerManagementPage } from "@/modules/admin/pages/organizer-management-page";
import { PricingConfigurationPage } from "@/modules/admin/pages/pricing-configuration-page";
import { DailyMealReportPage } from "@/modules/organizer/pages/daily-meal-report-page";
import { MonthlyReportPage } from "@/modules/organizer/pages/monthly-report-page";
import { OrganizerDashboardPage } from "@/modules/organizer/pages/organizer-dashboard-page";
import { StockManagementPage } from "@/modules/organizer/pages/stock-management-page";
import { SubmissionListPage } from "@/modules/organizer/pages/submission-list-page";
import { UserRole } from "@/modules/shared/types/domain";

const RoleRouter = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === UserRole.ADMIN) {
    return (
      <Routes>
        <Route path="/" element={<AdminLayout user={user} onLogout={logout} />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="organizers" element={<OrganizerManagementPage />} />
          <Route path="pricing" element={<PricingConfigurationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<OrganizerLayout user={user} onLogout={logout} />}>
        <Route index element={<OrganizerDashboardPage />} />
        <Route path="daily-report" element={<DailyMealReportPage />} />
        <Route path="submissions" element={<SubmissionListPage />} />
        <Route path="stock" element={<StockManagementPage />} />
        <Route path="monthly-report" element={<MonthlyReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <RoleRouter />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export const App = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
);