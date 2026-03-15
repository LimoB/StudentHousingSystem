// src/routes/LandlordRoutes.tsx
import { Route } from "react-router-dom";

import LandlordDashboard from "../pages/landlord/dashboard/LandlordDashboard";
import Bookings from "../pages/landlord/bookings/Bookings";
import Leases from "../pages/landlord/leases/Leases";
import MaintenanceRequests from "../pages/landlord/maintenance/MaintenanceRequests";
import Properties from "../pages/landlord/properties/Properties";
import AddProperty from "../pages/landlord/properties/AddProperty";

// Import both the List and the Add pages
import Units from "../pages/landlord/units/Units"; 
import AddUnit from "../pages/landlord/units/AddUnit";

const LandlordRoutes = () => {
  return (
    <>
      <Route path="dashboard" element={<LandlordDashboard />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="leases" element={<Leases />} />
      <Route path="maintenance" element={<MaintenanceRequests />} />

      {/* Property Management */}
      <Route path="properties" element={<Properties />} />
      <Route path="properties/add" element={<AddProperty />} />

      {/* Unit Management */}
      <Route path="units" element={<Units />} />      {/* The list of all units */}
      <Route path="units/add" element={<AddUnit />} /> {/* The form to add a unit */}
    </>
  );
};

export default LandlordRoutes;