import { Route } from "react-router-dom";

// Dashboard & Core
import StudentDashboard from "../pages/student/dashboard/StudentDashboard";
import Profile from "../components/Profile"; // SYNCED: The Unified Profile Component

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

// Notifications 
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
      {/* 1. Overview & Identity */}
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} /> {/* SYNCED: Identity Self-Service */}

      {/* 2. Booking Flow & Financials */}
      <Route path="bookings" element={<Bookings />} />
      <Route path="bookings/:id" element={<BookingDetail />} />
      <Route path="bookings/:bookingId/pay" element={<PaymentBookingApproval />} />
      <Route path="payments" element={<Payments />} />
      <Route path="payments/:id" element={<PaymentDetail />} />

      {/* 3. Living Experience (Leases & Maintenance) */}
      <Route path="leases" element={<Leases />} />
      <Route path="leases/:id" element={<LeaseDetail />} />
      <Route path="maintenance" element={<MaintenanceRequests />} />
      <Route path="maintenance/create" element={<CreateRequest />} />
      <Route path="maintenance/:id" element={<RequestDetail />} />

      {/* 4. Property Discovery */}
      <Route path="properties" element={<Properties />} />
      <Route path="properties/:id" element={<PropertyDetail />} />
      <Route path="properties/:id/book" element={<BookProperty />} />
      <Route path="properties/:id/units" element={<Units />} />
    </>
  );
};

export default StudentRoutes;