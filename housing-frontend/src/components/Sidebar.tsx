// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  role: "student" | "landlord" | "admin";
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();

  // Define menu items per role
  const menus = {
    student: [
      { title: "Dashboard", path: "/dashboard/student" },
      { title: "Bookings", path: "/bookings" },
      { title: "Leases", path: "/leases" },
      { title: "Payments", path: "/payments" },
      { title: "Maintenance", path: "/maintenance" },
    ],
    landlord: [
      { title: "Dashboard", path: "/dashboard/landlord" },
      { title: "Properties", path: "/properties" },
      { title: "Units", path: "/units" },
      { title: "Leases", path: "/leases" },
      { title: "Maintenance", path: "/maintenance" },
    ],
    admin: [
      { title: "Dashboard", path: "/dashboard/admin" },
      { title: "Users", path: "/users" },
      { title: "Properties", path: "/properties" },
      { title: "Bookings", path: "/bookings" },
      { title: "Reports", path: "/reports" },
    ],
  };

  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0">
      <div className="p-6 font-bold text-xl border-b">Housing System</div>

      <nav className="mt-4 flex flex-col">
        {menus[role].map((menu) => (
          <Link
            key={menu.title}
            to={menu.path}
            className={`px-6 py-3 hover:bg-gray-100 ${
              location.pathname.startsWith(menu.path) ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            {menu.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;