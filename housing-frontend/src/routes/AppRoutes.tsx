// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;




// // src/routes/AppRoutes.tsx
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// // Pages
// import Login from "../pages/auth/Login";
// import Register from "../pages/auth/Register";
// import Dashboard from "../pages/dashboard/Dashboard";
// import Bookings from "../pages/bookings/Bookings";
// import BookingDetail from "../pages/bookings/BookingDetail";
// import Leases from "../pages/leases/Leases";
// import LeaseDetail from "../pages/leases/LeaseDetail";
// import MaintenanceRequests from "../pages/maintenance/MaintenanceRequests";
// import RequestDetail from "../pages/maintenance/RequestDetail";
// import Payments from "../pages/payments/Payments";
// import PaymentDetail from "../pages/payments/PaymentDetail";
// import Properties from "../pages/properties/Properties";
// import PropertyDetail from "../pages/properties/PropertyDetail";
// import AddProperty from "../pages/properties/AddProperty";
// import Units from "../pages/units/Units";
// import AddUnit from "../pages/units/AddUnit";

// // =============================
// // PROTECTED ROUTE COMPONENT
// // =============================
// const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
//   const { token } = useSelector((state: any) => state.auth);
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };

// // =============================
// // APP ROUTES
// // =============================
// const AppRoutes: React.FC = () => {
//   return (
//     <Routes>
//       {/* PUBLIC */}
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />

//       {/* DASHBOARD (PROTECTED) */}
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />

//       {/* BOOKINGS */}
//       <Route
//         path="/bookings"
//         element={
//           <ProtectedRoute>
//             <Bookings />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/bookings/:id"
//         element={
//           <ProtectedRoute>
//             <BookingDetail />
//           </ProtectedRoute>
//         }
//       />

//       {/* LEASES */}
//       <Route
//         path="/leases"
//         element={
//           <ProtectedRoute>
//             <Leases />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/leases/:id"
//         element={
//           <ProtectedRoute>
//             <LeaseDetail />
//           </ProtectedRoute>
//         }
//       />

//       {/* MAINTENANCE */}
//       <Route
//         path="/maintenance"
//         element={
//           <ProtectedRoute>
//             <MaintenanceRequests />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/maintenance/:id"
//         element={
//           <ProtectedRoute>
//             <RequestDetail />
//           </ProtectedRoute>
//         }
//       />

//       {/* PAYMENTS */}
//       <Route
//         path="/payments"
//         element={
//           <ProtectedRoute>
//             <Payments />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/payments/:id"
//         element={
//           <ProtectedRoute>
//             <PaymentDetail />
//           </ProtectedRoute>
//         }
//       />

//       {/* PROPERTIES */}
//       <Route
//         path="/properties"
//         element={
//           <ProtectedRoute>
//             <Properties />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/properties/add"
//         element={
//           <ProtectedRoute>
//             <AddProperty />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/properties/:id"
//         element={
//           <ProtectedRoute>
//             <PropertyDetail />
//           </ProtectedRoute>
//         }
//       />

//       {/* UNITS */}
//       <Route
//         path="/units"
//         element={
//           <ProtectedRoute>
//             <Units />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/units/add"
//         element={
//           <ProtectedRoute>
//             <AddUnit />
//           </ProtectedRoute>
//         }
//       />

//       {/* DEFAULT ROUTE */}
//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// };

// export default AppRoutes;