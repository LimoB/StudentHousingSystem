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

  // Not logged in → send to login
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user hits root "/", redirect to role-specific dashboard
  if (location.pathname === "/") {
    switch (user.role) {
      case "admin":
        return <Navigate to="/dashboard/admin" replace />;
      case "landlord":
        return <Navigate to="/dashboard/landlord" replace />;
      case "student":
        return <Navigate to="/dashboard/student" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;