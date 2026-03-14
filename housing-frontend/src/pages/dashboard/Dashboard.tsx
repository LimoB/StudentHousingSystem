// src/pages/dashboard/Dashboard.tsx
import { useSelector } from "react-redux";

interface DashboardProps {
  type: "student" | "landlord" | "admin";
}

const Dashboard: React.FC<DashboardProps> = ({ type }) => {
  const { user } = useSelector((state: any) => state.auth);

  // Define widgets per role
  const widgets = {
    student: [
      { title: "Bookings", description: "View your housing bookings" },
      { title: "Leases", description: "Manage your lease agreements" },
      { title: "Payments", description: "Track rent and payments" },
      { title: "Maintenance", description: "Submit maintenance requests" },
    ],
    landlord: [
      { title: "Properties", description: "Manage your rental properties" },
      { title: "Units", description: "Manage units and availability" },
      { title: "Leases", description: "View and approve leases" },
      { title: "Maintenance", description: "Handle tenant requests" },
    ],
    admin: [
      { title: "Users", description: "Manage all users in the system" },
      { title: "Properties", description: "Overview of all properties" },
      { title: "Bookings", description: "Monitor all bookings" },
      { title: "Reports", description: "Generate system reports" },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Welcome {user?.fullName || "User"} ({type.charAt(0).toUpperCase() + type.slice(1)})
      </h1>

      <p className="text-gray-600 mb-6">
        {type === "student" && "This is your Student Dashboard."}
        {type === "landlord" && "This is your Landlord Dashboard."}
        {type === "admin" && "This is your Admin Dashboard."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets[type].map((widget) => (
          <div key={widget.title} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold">{widget.title}</h2>
            <p className="text-gray-500">{widget.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;