// src/routes/PublicRoutes.tsx
import { Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

const PublicRoutes = () => {
  return (
    <>
      {/* The main landing page / home */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </>
  );
};

export default PublicRoutes;