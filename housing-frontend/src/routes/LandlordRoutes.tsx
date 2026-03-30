// src/routes/LandlordRoutes.tsx
import { Route } from "react-router-dom";

import LandlordDashboard from "../pages/landlord/dashboard/LandlordDashboard";
import Bookings from "../components/Bookings";
import Leases from "../components/Leases";
import MaintenanceRequests from "../components/maintenance/MaintenanceRequests";
// IMPORT YOUR NEW PAYMENT COMPONENT
import PaymentDashboard from "../components/PaymentDashboard"; 

// Property Management
import Properties from "../components/properties/Properties";
import AddProperty from "../components/properties/AddProperty";
import PropertyDetail from "../components/PropertyDetail"; 

// Unit Management
import Units from "../components/units/Units"; 
import AddUnit from "../components/units/AddUnit";

const LandlordRoutes = () => {
  return (
    <>
      {/* Overview & Operations */}
      <Route path="dashboard" element={<LandlordDashboard />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="payments" element={<PaymentDashboard />} /> {/* NEW ROUTE */}
      <Route path="leases" element={<Leases />} />
      <Route path="maintenance" element={<MaintenanceRequests />} />

      {/* Property Management */}
      <Route path="properties" element={<Properties />} />
      <Route path="properties/add" element={<AddProperty />} />
      <Route path="properties/:id" element={<PropertyDetail />} />

      {/* Unit Management */}
      <Route path="units" element={<Units />} />      
      <Route path="units/add" element={<AddUnit />} />
    </>
  );
};

export default LandlordRoutes;