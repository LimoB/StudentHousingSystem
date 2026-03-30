import { Route } from "react-router-dom";

// Role-Specific Admin Pages
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import Reports from "../pages/admin/reports/Reports";
import Users from "../pages/admin/users/Users";

// Shared Logic Components
import Bookings from "../components/Bookings";
import Leases from "../components/Leases";
import PaymentDashboard from "../components/PaymentDashboard"; 
import MaintenanceRequests from "../components/maintenance/MaintenanceRequests";
import Notifications from "../components/Notifications"; 
import Profile from "../components/Profile"; // SYNCED: The Unified Profile Component

// Property & Unit Management
import Properties from "../components/properties/Properties";
import PropertyDetail from "../components/PropertyDetail"; 
import PropertyEdit from "../components/properties/PropertyEdit"; 
import Units from "../components/units/Units";
import UnitManagement from "../components/units/UnitManagement";

const AdminRoutes = () => {
  return (
    <>
      {/* 1. Overview & System Governance */}
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="reports" element={<Reports />} />
      <Route path="notifications" element={<Notifications />} />
      
      {/* SYNCED: Identity Self-Service */}
      <Route path="profile" element={<Profile />} />

      {/* 2. Operations Management */}
      <Route path="bookings" element={<Bookings />} />
      <Route path="leases" element={<Leases />} />
      <Route path="payments" element={<PaymentDashboard />} /> 
      <Route path="maintenance" element={<MaintenanceRequests />} />
      
      {/* 3. Property System Control */}
      <Route path="properties" element={<Properties />} />
      <Route path="properties/add" element={<PropertyEdit />} />
      <Route path="properties/edit/:id" element={<PropertyEdit />} />
      <Route path="properties/:id" element={<PropertyDetail />} />
      
      {/* 4. Unit System Control */}
      <Route path="units" element={<Units />} />
      <Route path="units/add" element={<UnitManagement />} />
      <Route path="units/edit/:id" element={<UnitManagement />} />
    </>
  );
};

export default AdminRoutes;