import { Route } from "react-router-dom";

// Dashboard & Core
import StudentDashboard from "../pages/student/dashboard/StudentDashboard";

// Bookings
import Bookings from "../pages/student/bookings/Bookings";
import BookingDetail from "../pages/student/bookings/BookingDetail";
import PaymentBookingApproval from "../pages/student/bookings/PaymentBookingApproval"; 

// Leases
import Leases from "../pages/student/leases/Leases";
import LeaseDetail from "../pages/student/leases/LeaseDetail";

// Maintenance
import MaintenanceRequests from "../pages/student/maintenance/MaintenanceRequests";
import RequestDetail from "../pages/student/maintenance/RequestDetail";
import CreateRequest from "../pages/student/maintenance/CreateRequest"; 

// Notifications (The component we just updated)
import Notifications from "../pages/student/notifications/Notifications";

// Payments
import Payments from "../pages/student/payments/Payments";
import PaymentDetail from "../pages/student/payments/PaymentDetail";

// Properties & Discovery
import Properties from "../pages/student/properties/Properties";
import PropertyDetail from "../pages/student/properties/PropertyDetail";
import BookProperty from "../pages/student/properties/BookProperty";
import Units from "../pages/student/units/Units";

const StudentRoutes = () => {
  return (
    <>
      {/* Overview */}
      <Route path="dashboard" element={<StudentDashboard />} />

      {/* Notifications - Essential for the "View Context" links from backend */}
      <Route path="notifications" element={<Notifications />} />

      {/* Booking Flow & Payments */}
      <Route path="bookings" element={<Bookings />} />
      <Route path="bookings/:id" element={<BookingDetail />} />
      <Route path="bookings/:bookingId/pay" element={<PaymentBookingApproval />} />

      {/* Lease Management */}
      <Route path="leases" element={<Leases />} />
      <Route path="leases/:id" element={<LeaseDetail />} />

      {/* Maintenance System */}
      <Route path="maintenance" element={<MaintenanceRequests />} />
      <Route path="maintenance/create" element={<CreateRequest />} />
      <Route path="maintenance/:id" element={<RequestDetail />} />

      {/* Financial History */}
      <Route path="payments" element={<Payments />} />
      <Route path="payments/:id" element={<PaymentDetail />} />

      {/* Property Discovery */}
      <Route path="properties" element={<Properties />} />
      <Route path="properties/:id" element={<PropertyDetail />} />
      <Route path="properties/:id/book" element={<BookProperty />} />

      {/* Unit Explorer */}
      <Route path="properties/:id/units" element={<Units />} />
    </>
  );
};

export default StudentRoutes;