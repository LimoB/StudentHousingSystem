import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";
import LandlordRoutes from "./LandlordRoutes";
import StudentRoutes from "./StudentRoutes";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES (Login, Register, etc.) */}
      {PublicRoutes()}

      {/* ADMIN SECTION */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {AdminRoutes()}
      </Route>

      {/* LANDLORD SECTION */}
      <Route
        path="/landlord"
        element={
          <ProtectedRoute allowedRoles={["landlord"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {LandlordRoutes()}
      </Route>

      {/* STUDENT SECTION */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {StudentRoutes()}
      </Route>

      {/* CATCH-ALL REDIRECT */}
      <Route path="/" element={<ProtectedRoute children={null} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;