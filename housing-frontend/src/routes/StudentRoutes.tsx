// src/routes/StudentRoutes.tsx
import { Route } from "react-router-dom";

import StudentDashboard from "../pages/student/dashboard/StudentDashboard";
import Bookings from "../pages/student/bookings/Bookings";
import BookingDetail from "../pages/student/bookings/BookingDetail";
import PaymentBookingApproval from "../pages/student/bookings/PaymentBookingApproval"; 
import Leases from "../pages/student/leases/Leases";
import LeaseDetail from "../pages/student/leases/LeaseDetail";
import MaintenanceRequests from "../pages/student/maintenance/MaintenanceRequests";
import RequestDetail from "../pages/student/maintenance/RequestDetail";
import CreateRequest from "../pages/student/maintenance/CreateRequest"; 
import Notifications from "../pages/student/notifications/Notifications";
import Payments from "../pages/student/payments/Payments";
import PaymentDetail from "../pages/student/payments/PaymentDetail";
import Properties from "../pages/student/properties/Properties";
import PropertyDetail from "../pages/student/properties/PropertyDetail";
import BookProperty from "../pages/student/properties/BookProperty";
import Units from "../pages/student/units/Units";

const StudentRoutes = () => {
  return (
    <>
      {/* Dashboard */}
      <Route path="dashboard" element={<StudentDashboard />} />

      {/* Bookings & Payments */}
      <Route path="bookings" element={<Bookings />} />
      <Route path="bookings/:id" element={<BookingDetail />} />
      
      {/* STABILITY FIX: 
          This route must exist here so that '/student/bookings/:bookingId/pay' 
          renders within the Student DashboardLayout Outlet.
      */}
      <Route path="bookings/:bookingId/pay" element={<PaymentBookingApproval />} />

      {/* Leases */}
      <Route path="leases" element={<Leases />} />
      <Route path="leases/:id" element={<LeaseDetail />} />

      {/* Maintenance */}
      <Route path="maintenance" element={<MaintenanceRequests />} />
      <Route path="maintenance/:id" element={<RequestDetail />} />
      <Route path="maintenance/create" element={<CreateRequest />} />

      {/* Notifications */}
      <Route path="notifications" element={<Notifications />} />

      {/* Payments */}
      <Route path="payments" element={<Payments />} />
      <Route path="payments/:id" element={<PaymentDetail />} />

      {/* Properties */}
      <Route path="properties" element={<Properties />} />
      <Route path="properties/:id" element={<PropertyDetail />} />
      <Route path="properties/:id/book" element={<BookProperty />} />

      {/* Units */}
      <Route path="properties/:id/units" element={<Units />} />
    </>
  );
};

export default StudentRoutes;