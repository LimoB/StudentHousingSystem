// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";

import Bookings from "../pages/bookings/Bookings";
import BookingDetail from "../pages/bookings/BookingDetail";

import Leases from "../pages/leases/Leases";
import LeaseDetail from "../pages/leases/LeaseDetail";

import MaintenanceRequests from "../pages/maintenance/MaintenanceRequests";
import RequestDetail from "../pages/maintenance/RequestDetail";

import Properties from "../pages/properties/Properties";
import PropertyDetail from "../pages/properties/PropertyDetail";
import AddProperty from "../pages/properties/AddProperty";

import Units from "../pages/units/Units";
import AddUnit from "../pages/units/AddUnit";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect /dashboard to role-specific dashboard */}
        <Route
          path="dashboard"
          element={<Navigate to="/dashboard/student" replace />}
        />

        {/* Role-specific dashboards */}
        <Route path="dashboard/student" element={<Dashboard type="student" />} />
        <Route path="dashboard/admin" element={<Dashboard type="admin" />} />
        <Route path="dashboard/landlord" element={<Dashboard type="landlord" />} />

        {/* BOOKINGS */}
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:id" element={<BookingDetail />} />

        {/* LEASES */}
        <Route path="leases" element={<Leases />} />
        <Route path="leases/:id" element={<LeaseDetail />} />

        {/* MAINTENANCE */}
        <Route path="maintenance" element={<MaintenanceRequests />} />
        <Route path="maintenance/:id" element={<RequestDetail />} />

        {/* PROPERTIES */}
        <Route path="properties" element={<Properties />} />
        <Route path="properties/add" element={<AddProperty />} />
        <Route path="properties/:id" element={<PropertyDetail />} />

        {/* UNITS */}
        <Route path="units" element={<Units />} />
        <Route path="units/add" element={<AddUnit />} />

        {/* Catch-all: redirect unknown paths inside dashboard to student dashboard */}
        <Route path="*" element={<Navigate to="/dashboard/student" replace />} />
      </Route>

      {/* Catch-all public paths */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;