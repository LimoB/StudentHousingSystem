// src/routes/LandlordRoutes.tsx
import { Route } from "react-router-dom";

import LandlordDashboard from "../pages/landlord/dashboard/LandlordDashboard";
import Bookings from "../components/Bookings";
import Leases from "../components/Leases";
import MaintenanceRequests from "../components/maintenance/MaintenanceRequests";
import PaymentDashboard from "../components/PaymentDashboard"; 

// Property Management
import Properties from "../components/properties/Properties";
import PropertyEdit from "../components/properties/PropertyEdit"; // Refactored component
import PropertyDetail from "../components/PropertyDetail"; 

// Unit Management
import Units from "../components/units/Units"; 
import UnitManagement from "../components/units/UnitManagement"; // Refactored component

const LandlordRoutes = () => {
  return (
    <>
      {/* Overview & Operations */}
      <Route path="dashboard" element={<LandlordDashboard />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="payments" element={<PaymentDashboard />} />
      <Route path="leases" element={<Leases />} />
      <Route path="maintenance" element={<MaintenanceRequests />} />

      {/* Property Management */}
      <Route path="properties" element={<Properties />} />
      <Route path="properties/add" element={<PropertyEdit />} />      {/* Uses PropertyEdit in "create" mode */}
      <Route path="properties/edit/:id" element={<PropertyEdit />} />  {/* Uses PropertyEdit in "edit" mode */}
      <Route path="properties/:id" element={<PropertyDetail />} />

      {/* Unit Management */}
      <Route path="units" element={<Units />} />      
      <Route path="units/add" element={<UnitManagement />} />         {/* Uses UnitManagement in "create" mode */}
      <Route path="units/edit/:id" element={<UnitManagement />} />    {/* Uses UnitManagement in "edit" mode */}
    </>
  );
};

export default LandlordRoutes;