import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaMoneyBillWave,
  FaTools,
  FaUsers,
  FaBuilding,
  FaBell,
  FaFileContract,
  FaChartLine
} from "react-icons/fa";
import type { RootState } from "../app/store";

interface DashboardProps {
  type: "student" | "landlord" | "admin";
}

const Dashboard: React.FC<DashboardProps> = ({ type }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const widgets: any = {
    student: [
      {
        title: "Properties",
        description: "Browse available houses and units",
        icon: <FaBuilding />,
        color: "from-purple-500 to-purple-600",
        path: "/properties"
      },
      {
        title: "Bookings",
        description: "Track your pending requests",
        icon: <FaBook />,
        color: "from-blue-500 to-blue-600",
        path: "/bookings"
      },
      {
        title: "Payments",
        description: "View receipts and pay rent",
        icon: <FaMoneyBillWave />,
        color: "from-green-500 to-green-600",
        path: "/payments"
      },
      {
        title: "Leases",
        description: "Active rental agreements",
        icon: <FaFileContract />,
        color: "from-indigo-500 to-indigo-600",
        path: "/leases"
      },
      {
        title: "Maintenance",
        description: "Report a broken item",
        icon: <FaTools />,
        color: "from-orange-500 to-orange-600",
        path: "/maintenance"
      },
      {
        title: "Notifications",
        description: "Updates and alerts",
        icon: <FaBell />,
        color: "from-pink-500 to-pink-600",
        path: "/notifications"
      }
    ],

    landlord: [
      {
        title: "My Properties",
        description: "Manage units and pricing",
        icon: <FaBuilding />,
        color: "from-purple-500 to-purple-600",
        path: "/properties"
      },
      {
        title: "Booking Requests",
        description: "Approve or reject students",
        icon: <FaBook />,
        color: "from-blue-500 to-blue-600",
        path: "/bookings"
      },
      {
        title: "Revenue",
        description: "Track monthly earnings",
        icon: <FaMoneyBillWave />,
        color: "from-green-500 to-green-600",
        path: "/payments"
      },
      {
        title: "Contracts",
        description: "Manage lease agreements",
        icon: <FaFileContract />,
        color: "from-indigo-500 to-indigo-600",
        path: "/leases"
      },
      {
        title: "Work Orders",
        description: "Handle repair requests",
        icon: <FaTools />,
        color: "from-orange-500 to-orange-600",
        path: "/maintenance"
      },
      {
        title: "My Tenants",
        description: "View resident information",
        icon: <FaUsers />,
        color: "from-teal-500 to-teal-600",
        path: "/tenants"
      }
    ],

    admin: [
      {
        title: "System Users",
        description: "Manage student/landlord accounts",
        icon: <FaUsers />,
        color: "from-red-500 to-red-600",
        path: "/users"
      },
      {
        title: "All Properties",
        description: "Audit housing inventory",
        icon: <FaBuilding />,
        color: "from-purple-500 to-purple-600",
        path: "/properties"
      },
      {
        title: "All Bookings",
        description: "Monitor system transactions",
        icon: <FaBook />,
        color: "from-blue-500 to-blue-600",
        path: "/bookings"
      },
      {
        title: "Finance",
        description: "Global payment tracking",
        icon: <FaMoneyBillWave />,
        color: "from-green-500 to-green-600",
        path: "/payments"
      },
      {
        title: "Leases",
        description: "Monitor active contracts",
        icon: <FaFileContract />,
        color: "from-indigo-500 to-indigo-600",
        path: "/leases"
      },
      {
        title: "Maintenance",
        description: "Overall service status",
        icon: <FaTools />,
        color: "from-orange-500 to-orange-600",
        path: "/maintenance"
      },
      {
        title: "System Reports",
        description: "Analytics and logs",
        icon: <FaChartLine />,
        color: "from-teal-500 to-teal-600",
        path: "/reports"
      }
    ]
  };

  const handleNavigate = (path: string) => {
    navigate(`/${type}${path}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Welcome back, <span className="text-blue-600">{user?.fullName?.split(' ')[0] || "User"}</span>!
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
            {type} Access
          </span>
          <p className="text-gray-500 font-medium">
            {type === "student" && "Everything you need for your campus housing is right here."}
            {type === "landlord" && "Manage your assets and track your business growth."}
            {type === "admin" && "Total system oversight and administrative control."}
          </p>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {widgets[type].map((widget: any) => (
          <div
            key={widget.title}
            onClick={() => handleNavigate(widget.path)}
            className="group relative bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 cursor-pointer overflow-hidden active:scale-95"
          >
            {/* Animated Gradient Background on Hover */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${widget.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-bl-[5rem]`} />

            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${widget.color} text-white flex items-center justify-center text-2xl shadow-lg mb-6 group-hover:rotate-6 transition-transform duration-300`}>
                {widget.icon}
              </div>

              <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
                {widget.title}
              </h2>

              <p className="text-gray-500 font-medium leading-relaxed">
                {widget.description}
              </p>
            </div>

            {/* Bottom Arrow Indicator */}
            <div className="mt-8 flex items-center text-sm font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              Go to {widget.title} <span className="ml-2">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;