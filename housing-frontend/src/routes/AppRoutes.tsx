import { Routes, Route, Navigate } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";
import LandlordRoutes from "./LandlordRoutes";
import StudentRoutes from "./StudentRoutes";

import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      {PublicRoutes()}

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        {AdminRoutes()}
      </Route>

      {/* LANDLORD */}
      <Route
        path="/landlord"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["landlord"]}>
              <DashboardLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        {LandlordRoutes()}
      </Route>

      {/* STUDENT */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["student"]}>
              <DashboardLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        {StudentRoutes()}
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;