import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  // Pull auth state from Redux
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Determine the active role. 
  // We check Redux first, then fallback to localStorage for hydration stability.
  const activeRole = 
    user?.role || 
    JSON.parse(localStorage.getItem("user") || "{}")?.role || 
    "student";

  /**
   * SAFETY CHECK:
   * If there is no token in Redux and nothing in localStorage, 
   * we stop rendering here. ProtectedRoute will handle the redirect to /login.
   */
  if (!token && !localStorage.getItem("token")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* SIDEBAR 
          Pass the role to show relevant menu items (Student vs Landlord vs Admin)
      */}
      <Sidebar role={activeRole} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* NAVBAR 
            Prop 'user' removed to fix TypeScript error ts(2322).
            The Navbar component now pulls user data directly from Redux.
        */}
        <Navbar />

        {/* MAIN CONTENT AREA 
            Outlet renders the specific page (e.g., Student Home, Landlord Properties)
        */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;