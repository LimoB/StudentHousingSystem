import { Route } from "react-router-dom";

import LandlordDashboard from "../pages/landlord/dashboard/LandlordDashboard";
import Bookings from "../pages/landlord/bookings/Bookings";
import Leases from "../pages/landlord/leases/Leases";
import MaintenanceRequests from "../pages/landlord/maintenance/MaintenanceRequests";
import Properties from "../pages/landlord/properties/Properties";
import AddProperty from "../pages/landlord/properties/AddProperty";
import AddUnit from "../pages/landlord/units/AddUnit";

const LandlordRoutes = () => {
  return (
    <>
      <Route path="dashboard" element={<LandlordDashboard />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="leases" element={<Leases />} />
      <Route path="maintenance" element={<MaintenanceRequests />} />

      <Route path="properties" element={<Properties />} />
      <Route path="properties/add" element={<AddProperty />} />

      <Route path="units/add" element={<AddUnit />} />
    </>
  );
};

export default LandlordRoutes;