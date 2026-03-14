// src/layouts/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const { user } = useSelector((state: any) => state.auth);
  const role = user?.role || "student"; // default to student if somehow missing

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar gets role */}
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;