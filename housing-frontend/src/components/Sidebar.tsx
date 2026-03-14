// import React from "react";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6">Housing</h2>

      <nav className="flex flex-col gap-4">

        <Link to="/dashboard" className="hover:text-gray-300">
          Dashboard
        </Link>

        <Link to="/bookings" className="hover:text-gray-300">
          Bookings
        </Link>

        <Link to="/leases" className="hover:text-gray-300">
          Leases
        </Link>

        <Link to="/maintenance" className="hover:text-gray-300">
          Maintenance
        </Link>

        <Link to="/payments" className="hover:text-gray-300">
          Payments
        </Link>

        <Link to="/properties" className="hover:text-gray-300">
          Properties
        </Link>

        <Link to="/units" className="hover:text-gray-300">
          Units
        </Link>

      </nav>
    </aside>
  );
};

export default Sidebar;