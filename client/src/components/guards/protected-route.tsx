import { Navigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/auth-context";
import { useLanguage } from "@/modules/shared/context/language-context";
import { UserRole } from "@/modules/shared/types/domain";

interface ProtectedRouteProps {
  role?: UserRole;
  children: React.ReactNode;
}

export const ProtectedRoute = ({ role, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">{t("loadingSession")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === UserRole.ADMIN ? "/" : "/"} replace />;
  }

  return <>{children}</>;
};
