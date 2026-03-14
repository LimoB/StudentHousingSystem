// import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../app/slices/authSlice";

const Navbar: React.FC = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">
        Student Housing System
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">Welcome</span>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;