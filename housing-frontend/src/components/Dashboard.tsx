import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaHome,
  FaMoneyBillWave,
  FaTools,
  FaUsers,
  FaFileAlt,
  FaBuilding,
  FaBell,
  FaDoorOpen
} from "react-icons/fa";

interface DashboardProps {
  type: "student" | "landlord" | "admin";
}

const Dashboard: React.FC<DashboardProps> = ({ type }) => {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const widgets: any = {
    student: [
      {
        title: "Properties",
        description: "Browse available properties",
        icon: <FaBuilding />,
        color: "border-purple-500",
        path: "/properties"
      },
      {
        title: "Units",
        description: "View available rooms and units",
        icon: <FaDoorOpen />,
        color: "border-pink-500",
        path: "/units"
      },
      {
        title: "Bookings",
        description: "Manage your booking requests",
        icon: <FaBook />,
        color: "border-blue-500",
        path: "/bookings"
      },
      {
        title: "Payments",
        description: "Track rent payments",
        icon: <FaMoneyBillWave />,
        color: "border-green-500",
        path: "/payments"
      },
      {
        title: "Leases",
        description: "View lease agreements",
        icon: <FaHome />,
        color: "border-indigo-500",
        path: "/leases"
      },
      {
        title: "Maintenance",
        description: "Submit maintenance requests",
        icon: <FaTools />,
        color: "border-yellow-500",
        path: "/maintenance"
      },
      {
        title: "Notifications",
        description: "View system notifications",
        icon: <FaBell />,
        color: "border-gray-500",
        path: "/notifications"
      }
    ],

    landlord: [
      {
        title: "Properties",
        description: "Manage your properties",
        icon: <FaBuilding />,
        color: "border-purple-500",
        path: "/properties"
      },
      {
        title: "Units",
        description: "Manage property units",
        icon: <FaDoorOpen />,
        color: "border-pink-500",
        path: "/units"
      },
      {
        title: "Bookings",
        description: "Approve or reject bookings",
        icon: <FaBook />,
        color: "border-blue-500",
        path: "/bookings"
      },
      {
        title: "Payments",
        description: "Track tenant payments",
        icon: <FaMoneyBillWave />,
        color: "border-green-500",
        path: "/payments"
      },
      {
        title: "Leases",
        description: "Manage lease agreements",
        icon: <FaHome />,
        color: "border-indigo-500",
        path: "/leases"
      },
      {
        title: "Maintenance",
        description: "Handle tenant maintenance requests",
        icon: <FaTools />,
        color: "border-yellow-500",
        path: "/maintenance"
      }
    ],

    admin: [
      {
        title: "Users",
        description: "Manage all system users",
        icon: <FaUsers />,
        color: "border-red-500",
        path: "/users"
      },
      {
        title: "Properties",
        description: "View all properties",
        icon: <FaBuilding />,
        color: "border-purple-500",
        path: "/properties"
      },
      {
        title: "Units",
        description: "View all property units",
        icon: <FaDoorOpen />,
        color: "border-pink-500",
        path: "/units"
      },
      {
        title: "Bookings",
        description: "Monitor all bookings",
        icon: <FaBook />,
        color: "border-blue-500",
        path: "/bookings"
      },
      {
        title: "Payments",
        description: "Track all system payments",
        icon: <FaMoneyBillWave />,
        color: "border-green-500",
        path: "/payments"
      },
      {
        title: "Leases",
        description: "View active leases",
        icon: <FaHome />,
        color: "border-indigo-500",
        path: "/leases"
      },
      {
        title: "Maintenance",
        description: "Monitor maintenance requests",
        icon: <FaTools />,
        color: "border-yellow-500",
        path: "/maintenance"
      },
      {
        title: "Reports",
        description: "Generate reports",
        icon: <FaFileAlt />,
        color: "border-teal-500",
        path: "/reports"
      }
    ]
  };

  const handleNavigate = (path: string) => {
    navigate(`/${type}${path}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Welcome {user?.fullName || "User"} (
        {type.charAt(0).toUpperCase() + type.slice(1)})
      </h1>

      <p className="text-gray-600 mb-6">
        {type === "student" && "Manage your housing, bookings, and payments."}
        {type === "landlord" && "Manage your properties and tenants."}
        {type === "admin" && "System administration dashboard."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets[type].map((widget: any) => (
          <div
            key={widget.title}
            onClick={() => handleNavigate(widget.path)}
            className={`cursor-pointer bg-white shadow-md rounded-lg p-5 flex flex-col justify-between transform transition-transform hover:scale-105 border-l-4 ${widget.color}`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl text-gray-700">{widget.icon}</div>
              <h2 className="text-lg font-semibold text-gray-800">
                {widget.title}
              </h2>
            </div>

            <p className="text-gray-500">{widget.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;