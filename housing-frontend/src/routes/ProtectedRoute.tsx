import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";
import type { RootState } from "../app/store";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("student" | "landlord" | "admin")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Check both Redux state AND localStorage for persistence reliability
  const isAuthenticated = token || localStorage.getItem("token");
  const currentUser = user || JSON.parse(localStorage.getItem("user") || "null");

  // 1. Not logged in -> Redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Role Authorization -> Prevent cross-role access
  // Example: A student trying to access /admin/dashboard
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect them to their own correct dashboard if they are in the wrong place
    return <Navigate to={`/${currentUser.role}/dashboard`} replace />;
  }

  // 3. Root Path Redirection
  if (location.pathname === "/") {
    return <Navigate to={`/${currentUser.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;