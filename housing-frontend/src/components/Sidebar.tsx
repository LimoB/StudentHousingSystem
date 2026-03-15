import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBook,
  FaMoneyBillWave,
  FaTools,
  FaUsers,
  FaFileAlt,
  FaBuilding,
  FaBell,
  FaDoorOpen
} from "react-icons/fa";

interface SidebarProps {
  role: "student" | "landlord" | "admin";
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();

  const menus = {
    student: [
      { title: "Dashboard", path: "dashboard", icon: <FaHome /> },
      { title: "Properties", path: "properties", icon: <FaBuilding /> },
      { title: "Units", path: "units", icon: <FaDoorOpen /> },
      { title: "Bookings", path: "bookings", icon: <FaBook /> },
      { title: "Payments", path: "payments", icon: <FaMoneyBillWave /> },
      { title: "Leases", path: "leases", icon: <FaHome /> },
      { title: "Maintenance", path: "maintenance", icon: <FaTools /> },
      { title: "Notifications", path: "notifications", icon: <FaBell /> },
    ],

    landlord: [
      { title: "Dashboard", path: "dashboard", icon: <FaHome /> },
      { title: "Properties", path: "properties", icon: <FaBuilding /> },
      { title: "Units", path: "units", icon: <FaDoorOpen /> },
      { title: "Bookings", path: "bookings", icon: <FaBook /> },
      { title: "Payments", path: "payments", icon: <FaMoneyBillWave /> },
      { title: "Leases", path: "leases", icon: <FaHome /> },
      { title: "Maintenance", path: "maintenance", icon: <FaTools /> },
      { title: "Tenants", path: "tenants", icon: <FaUsers /> },
    ],

    admin: [
      { title: "Dashboard", path: "dashboard", icon: <FaHome /> },
      { title: "Users", path: "users", icon: <FaUsers /> },
      { title: "Properties", path: "properties", icon: <FaBuilding /> },
      { title: "Units", path: "units", icon: <FaDoorOpen /> },
      { title: "Bookings", path: "bookings", icon: <FaBook /> },
      { title: "Payments", path: "payments", icon: <FaMoneyBillWave /> },
      { title: "Leases", path: "leases", icon: <FaHome /> },
      { title: "Maintenance", path: "maintenance", icon: <FaTools /> },
      { title: "Notifications", path: "notifications", icon: <FaBell /> },
      { title: "Reports", path: "reports", icon: <FaFileAlt /> },
    ],
  };

  return (
    <aside className="w-64 bg-white shadow-lg flex-shrink-0">
      <div className="p-6 font-bold text-xl border-b text-gray-800">
        Housing System
      </div>

      <nav className="mt-4 flex flex-col">

        {menus[role].map((menu) => {

          const fullPath = `/${role}/${menu.path}`;

          const isActive = location.pathname.startsWith(fullPath);

          return (
            <Link
              key={menu.title}
              to={fullPath}
              className={`px-6 py-3 rounded-lg mb-1 flex items-center gap-3 font-medium text-gray-700 hover:bg-gray-100 transition ${
                isActive ? "bg-gray-200 font-semibold shadow-inner" : ""
              }`}
            >
              {menu.icon}
              {menu.title}
            </Link>
          );
        })}

      </nav>
    </aside>
  );
};

export default Sidebar;