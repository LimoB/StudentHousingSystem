import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Dashboard from "../pages/dashboard/Dashboard";
import Bookings from "../pages/bookings/Bookings";
import BookingDetail from "../pages/bookings/BookingDetail";

import Leases from "../pages/leases/Leases";
import LeaseDetail from "../pages/leases/LeaseDetail";

import MaintenanceRequests from "../pages/maintenance/MaintenanceRequests";
import RequestDetail from "../pages/maintenance/RequestDetail";

// import Payments from "../pages/payments/Payments";
// import PaymentDetail from "../pages/payments/PaymentDetail";

import Properties from "../pages/properties/Properties";
import PropertyDetail from "../pages/properties/PropertyDetail";
import AddProperty from "../pages/properties/AddProperty";

import Units from "../pages/units/Units";
import AddUnit from "../pages/units/AddUnit";

import DashboardLayout from "../layouts/DashboardLayout";

const AppRoutes = () => {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED DASHBOARD */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        <Route path="dashboard" element={<Dashboard />} />

        {/* BOOKINGS */}
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:id" element={<BookingDetail />} />

        {/* LEASES */}
        <Route path="leases" element={<Leases />} />
        <Route path="leases/:id" element={<LeaseDetail />} />

        {/* MAINTENANCE */}
        <Route path="maintenance" element={<MaintenanceRequests />} />
        <Route path="maintenance/:id" element={<RequestDetail />} />

        {/* PAYMENTS */}
        {/* <Route path="payments" element={<Payments />} />
        <Route path="payments/:id" element={<PaymentDetail />} /> */}

        {/* PROPERTIES */}
        <Route path="properties" element={<Properties />} />
        <Route path="properties/add" element={<AddProperty />} />
        <Route path="properties/:id" element={<PropertyDetail />} />

        {/* UNITS */}
        <Route path="units" element={<Units />} />
        <Route path="units/add" element={<AddUnit />} />

      </Route>

    </Routes>
  );
};

export default AppRoutes;