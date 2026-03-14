// src/components/Navbar.tsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../app/slices/authSlice";
import { FaBell } from "react-icons/fa"; // FontAwesome bell icon

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const { notifications } = useSelector((state: any) => state.notifications); // assuming you have a notification slice

  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center relative">
      {/* Left side: App title */}
      <h1 className="text-xl font-bold text-gray-800">Student Housing System</h1>

      {/* Right side: User info + notifications + logout */}
      <div className="flex items-center gap-4 relative">
        {user && (
          <div className="flex items-center gap-3">
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            {/* User info */}
            <div className="flex flex-col">
              <span className="text-gray-800 font-medium">{user.fullName}</span>
              <span className="text-gray-500 text-sm capitalize">{user.role}</span>
            </div>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FaBell className="text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg overflow-hidden z-50">
              <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
              {notifications.length === 0 && (
                <div className="p-3 text-gray-500 text-sm">No notifications</div>
              )}
              <ul>
                {notifications.slice(0, 5).map((n: any, idx: number) => (
                  <li
                    key={idx}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                  >
                    {n.message}
                  </li>
                ))}
              </ul>
              {notifications.length > 5 && (
                <div className="p-2 text-center text-blue-600 text-sm hover:bg-gray-100 cursor-pointer">
                  View all
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;