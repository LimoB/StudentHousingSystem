import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";
import type { RootState } from "../app/store";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("student" | "landlord" | "admin")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { token: reduxToken, user: reduxUser } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // STABILITY FIX: Prioritize localStorage during route transitions
  // This prevents the "logout" flicker when Redux is still updating.
  const storedToken = localStorage.getItem("token");
  const storedUserRaw = localStorage.getItem("user");
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

  const isAuthenticated = !!(reduxToken || storedToken);
  const currentUser = reduxUser || storedUser;

  // 1. Not logged in -> Redirect to login
  if (!isAuthenticated || !currentUser) {
    // Log for debugging if you hit the redirect unexpectedly
    console.warn("[AuthGuard] No session found. Redirecting to login.");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Role Authorization
  // We use the role from storedUser if reduxUser is temporarily null
  const currentRole = currentUser?.role;

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    console.warn(`[AuthGuard] Access denied for role: ${currentRole}`);
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  }

  // 3. Root Path Redirection
  if (location.pathname === "/") {
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;