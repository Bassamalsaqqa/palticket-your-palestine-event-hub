import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language, t } = useLanguage();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">{t.common.loading}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${language}/login`} state={{ from: location, message: t.access.loginRequired }} replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { language, t } = useLanguage();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">{t.common.loading}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${language}/login`} state={{ from: location, message: t.access.loginRequired }} replace />;
  }

  if (!isAdmin) {
    // If authenticated but not admin, redirect to home or login with error
    // Redirecting to login allows showing the error message easily
    return <Navigate to={`/${language}/login`} state={{ from: location, message: t.access.adminOnly }} replace />;
  }

  return <Outlet />;
}

export function RequireStaff() {
  const { isAuthenticated, isStaff, isLoading } = useAuth();
  const { language, t } = useLanguage();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">{t.common.loading}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${language}/login`} state={{ from: location, message: t.access.loginRequired }} replace />;
  }

  if (!isStaff) {
    return <Navigate to={`/${language}/login`} state={{ from: location, message: t.access.staffOnly }} replace />;
  }

  return <Outlet />;
}
