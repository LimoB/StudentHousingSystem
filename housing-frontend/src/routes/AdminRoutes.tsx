import { Route } from "react-router-dom";

import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import Bookings from "../pages/admin/bookings/Bookings";
import Leases from "../pages/admin/leases/Leases";
import Properties from "../pages/admin/properties/Properties";
import Reports from "../pages/admin/reports/Reports";
import Users from "../pages/admin/users/Users";

// IMPORT YOUR NEW COMPONENT
// Assuming you saved it in the landlord folder, you can share it here
import PaymentDashboard from "../components/PaymentDashboard"; 

const AdminRoutes = () => {
  return (
    <>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="leases" element={<Leases />} />
      
      {/* UPDATE THIS LINE */}
      <Route path="payments" element={<PaymentDashboard />} /> 
      
      <Route path="properties" element={<Properties />} />
      <Route path="reports" element={<Reports />} />
      <Route path="users" element={<Users />} />
    </>
  );
};

export default AdminRoutes;