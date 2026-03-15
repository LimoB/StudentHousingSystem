import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaBook,
  FaMoneyBillWave,
  FaTools,
  FaUsers,
  FaFileAlt,
  FaBuilding,
  FaBell,
  FaDoorOpen,
  FaFileContract
} from "react-icons/fa";
import type { RootState } from "../app/store";

interface SidebarProps {
  role: "student" | "landlord" | "admin";
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  
  // Get notifications to show count in the sidebar
  const { notifications } = useSelector((state: RootState) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const menus = {
    student: [
      { title: "Dashboard", path: "dashboard", icon: <FaHome /> },
      { title: "Properties", path: "properties", icon: <FaBuilding /> },
      { title: "Bookings", path: "bookings", icon: <FaBook /> },
      { title: "Payments", path: "payments", icon: <FaMoneyBillWave /> },
      { title: "Leases", path: "leases", icon: <FaFileContract /> }, // Fixed Icon
      { title: "Maintenance", path: "maintenance", icon: <FaTools /> },
      { title: "Notifications", path: "notifications", icon: <FaBell />, badge: unreadCount },
    ],

    landlord: [
      { title: "Dashboard", path: "dashboard", icon: <FaHome /> },
      { title: "Properties", path: "properties", icon: <FaBuilding /> },
      { title: "Units", path: "units", icon: <FaDoorOpen /> },
      { title: "Bookings", path: "bookings", icon: <FaBook /> },
      { title: "Payments", path: "payments", icon: <FaMoneyBillWave /> },
      { title: "Leases", path: "leases", icon: <FaFileContract /> }, // Fixed Icon
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
      { title: "Leases", path: "leases", icon: <FaFileContract /> }, // Fixed Icon
      { title: "Maintenance", path: "maintenance", icon: <FaTools /> },
      { title: "Notifications", path: "notifications", icon: <FaBell />, badge: unreadCount },
      { title: "Reports", path: "reports", icon: <FaFileAlt /> },
    ],
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Branding - Hidden if Navbar handles it, but kept for Layout structure */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <FaBuilding className="text-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-900 leading-none tracking-tighter">Housing</span>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mt-1">System</span>
          </div>
        </div>
      </div>

      <nav className="mt-8 flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
        
        {menus[role].map((menu) => {
          const fullPath = `/${role}/${menu.path}`;
          const isActive = location.pathname.startsWith(fullPath);

          return (
            <Link
              key={menu.title}
              to={fullPath}
              className={`group flex items-center justify-between px-6 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-1" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-blue-600 hover:translate-x-1"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-lg transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  {menu.icon}
                </span>
                <span className={`text-sm font-bold ${isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"}`}>
                  {menu.title}
                </span>
              </div>

              {/* Sidebar Notification Badge */}
              {menu.badge !== undefined && menu.badge > 0 && !isActive && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-4 ring-white shadow-sm">
                  {menu.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / Quick Support */}
      <div className="p-6">
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
          <p className="text-xs font-black text-gray-900 mb-1 uppercase tracking-tighter">Need Help?</p>
          <p className="text-[10px] text-gray-500 mb-4 font-medium">Contact management for support</p>
          <button className="w-full py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-bold text-gray-700 hover:bg-gray-100 transition shadow-sm">
            Contact Admin
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;