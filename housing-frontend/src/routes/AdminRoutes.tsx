import { Route } from "react-router-dom";

// Role-Specific Admin Pages
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import Reports from "../pages/admin/reports/Reports";
import Users from "../pages/admin/users/Users";

// Shared Logic Components (The "Engine")
import Bookings from "../components/Bookings";
import Leases from "../components/Leases";
import PaymentDashboard from "../components/PaymentDashboard"; 
import MaintenanceRequests from "../components/maintenance/MaintenanceRequests";
import Notifications from "../components/Notifications"; 

// Property & Unit Management (Shared Engine - Refactored)
import Properties from "../components/properties/Properties";
import PropertyDetail from "../components/PropertyDetail"; 
import PropertyEdit from "../components/properties/PropertyEdit"; // Matches Landlord
import Units from "../components/units/Units";
import UnitManagement from "../components/units/UnitManagement"; // Matches Landlord

const AdminRoutes = () => {
  return (
    <>
      {/* Overview & Systems */}
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="reports" element={<Reports />} />
      <Route path="notifications" element={<Notifications />} />

      {/* Shared Management Operations */}
      <Route path="bookings" element={<Bookings />} />
      <Route path="leases" element={<Leases />} />
      <Route path="payments" element={<PaymentDashboard />} /> 
      <Route path="maintenance" element={<MaintenanceRequests />} />
      
      {/* Property System Control */}
      <Route path="properties" element={<Properties />} />
      <Route path="properties/:id" element={<PropertyDetail />} />
      
      {/* Admin needs these routes so the "Inspect" buttons work, 
          even if the UI mostly directs them to PropertyDetail */}
      <Route path="properties/add" element={<PropertyEdit />} />
      <Route path="properties/edit/:id" element={<PropertyEdit />} />
      
      {/* Unit System Control */}
      <Route path="units" element={<Units />} />
      <Route path="units/add" element={<UnitManagement />} />
      <Route path="units/edit/:id" element={<UnitManagement />} />
    </>
  );
};

export default AdminRoutes;