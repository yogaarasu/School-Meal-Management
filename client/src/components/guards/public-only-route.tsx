import { Navigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/context/auth-context";
import { useLanguage } from "@/modules/shared/context/language-context";

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">{t("loadingSession")}</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
