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
      {/* 1. PUBLIC ROUTES */}
      {PublicRoutes()}

      {/* 2. ADMIN SECTION */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Call the routes as children of the Layout */}
        {AdminRoutes()}
      </Route>

      {/* 3. LANDLORD SECTION */}
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

      {/* 4. STUDENT SECTION */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* FIXED: We include the routes directly here. 
            Because StudentRoutes() returns <Route> components, 
            they will render inside the <Outlet /> of DashboardLayout.
        */}
        {StudentRoutes()}
        
        {/* Redirect /student to /student/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* 5. CATCH-ALL REDIRECT */}
      {/* If path is "/", ProtectedRoute will handle the redirection logic */}
      <Route path="/" element={<ProtectedRoute children={null} />} />
      
      {/* Absolute fallback to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;