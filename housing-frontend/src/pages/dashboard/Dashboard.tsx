// import React from "react";
import { useSelector } from "react-redux";

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Welcome {user?.name || "User"}
      </h1>

      <p className="text-gray-600 mb-6">
        This is your Student Housing Dashboard.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Bookings</h2>
          <p className="text-gray-500">View your housing bookings</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Leases</h2>
          <p className="text-gray-500">Manage your lease agreements</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Payments</h2>
          <p className="text-gray-500">Track rent and payments</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Maintenance</h2>
          <p className="text-gray-500">Submit maintenance requests</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;