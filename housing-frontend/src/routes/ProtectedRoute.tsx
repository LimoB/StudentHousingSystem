// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token, user } = useSelector((state: any) => state.auth);
  const location = useLocation();

  // If Redux hasn't loaded user/token yet, show nothing (or a loader)
  if (token === undefined || user === undefined) {
    return null; // or <LoadingSpinner /> if you have one
  }

  // Not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect from root "/" to role-specific dashboard
  if (location.pathname === "/") {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "landlord":
        return <Navigate to="/landlord/dashboard" replace />;
      case "student":
        return <Navigate to="/student/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Allow access to child routes
  return <>{children}</>;
};

export default ProtectedRoute;