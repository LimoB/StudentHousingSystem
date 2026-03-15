// src/layouts/DashboardLayout.tsx

import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const role = user?.role || "student";

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar role={role} />

      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;