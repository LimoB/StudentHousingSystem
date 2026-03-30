import { Route } from "react-router-dom";

import LandlordDashboard from "../pages/landlord/dashboard/LandlordDashboard";
import Bookings from "../components/Bookings";
import Leases from "../components/Leases";
import MaintenanceRequests from "../components/maintenance/MaintenanceRequests";
import PaymentDashboard from "../components/PaymentDashboard"; 
import Notifications from "../components/Notifications"; 
import Profile from "../components/Profile"; // SYNCED: The Unified Profile Component

// Property Management
import Properties from "../components/properties/Properties";
import PropertyEdit from "../components/properties/PropertyEdit"; 
import PropertyDetail from "../components/PropertyDetail"; 

// Unit Management
import Units from "../components/units/Units"; 
import UnitManagement from "../components/units/UnitManagement";

const LandlordRoutes = () => {
  return (
    <>
      {/* 1. Overview & Identity */}
      <Route path="dashboard" element={<LandlordDashboard />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} /> {/* SYNCED: Identity Self-Service */}

      {/* 2. Operations & Revenue */}
      <Route path="bookings" element={<Bookings />} />
      <Route path="payments" element={<PaymentDashboard />} />
      <Route path="leases" element={<Leases />} />
      <Route path="maintenance" element={<MaintenanceRequests />} />

      {/* 3. Portfolio Management (Properties) */}
      <Route path="properties" element={<Properties />} />
      <Route path="properties/add" element={<PropertyEdit />} />      
      <Route path="properties/edit/:id" element={<PropertyEdit />} />  
      <Route path="properties/:id" element={<PropertyDetail />} />

      {/* 4. Inventory Management (Units) */}
      <Route path="units" element={<Units />} />      
      <Route path="units/add" element={<UnitManagement />} />         
      <Route path="units/edit/:id" element={<UnitManagement />} />    
    </>
  );
};

export default LandlordRoutes;