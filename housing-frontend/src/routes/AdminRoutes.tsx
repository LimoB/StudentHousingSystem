import { Route } from "react-router-dom";

import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import Bookings from "../pages/admin/bookings/Bookings";
import Leases from "../pages/admin/leases/Leases";
import Payments from "../pages/admin/payments/Payments";
import Properties from "../pages/admin/properties/Properties";
import Reports from "../pages/admin/reports/Reports";
import Users from "../pages/admin/users/Users";

const AdminRoutes = () => {
  return (
    <>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="leases" element={<Leases />} />
      <Route path="payments" element={<Payments />} />
      <Route path="properties" element={<Properties />} />
      <Route path="reports" element={<Reports />} />
      <Route path="users" element={<Users />} />
    </>
  );
};

export default AdminRoutes;