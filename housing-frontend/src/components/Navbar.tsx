import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../app/slices/authSlice";
import { markNotificationAsRead } from "../app/slices/notificationSlice";
import { FaBell, FaSignOutAlt, FaUser, FaChevronDown, FaCog, FaCreditCard, FaTools, FaInfoCircle } from "react-icons/fa";
import type { RootState, AppDispatch } from "../app/store";

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user } = useSelector((state: RootState) => state.auth);
  // Matches the 'isRead' property from our updated slice
  const { notifications } = useSelector((state: RootState) => state.notifications);
  
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Filter based on 'isRead' from backend
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNotificationClick = (id: number, isRead: boolean) => {
    if (!isRead) dispatch(markNotificationAsRead(id));
    setShowNotif(false);
    navigate(`/${user?.role}/notifications`);
  };

  // Helper to show relevant icons in the dropdown
  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <FaCreditCard className="text-emerald-500" />;
      case 'maintenance': return <FaTools className="text-amber-500" />;
      default: return <FaInfoCircle className="text-blue-500" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-[100] border-b border-gray-100 px-4 md:px-8 py-3 flex justify-between items-center">
      <Link to={`/${user?.role}/dashboard`} className="flex items-center gap-2 group">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
          H
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tighter hidden sm:block">
          Housing<span className="text-blue-600">Sync</span>
        </h1>
      </Link>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className={`p-2.5 rounded-xl transition-all relative ${
              showNotif ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-[1.5rem] overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-5 duration-200">
              <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                <span className="font-black text-gray-900">Notifications</span>
                {unreadCount > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black">NEW</span>}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 text-sm font-medium">No new alerts</div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {notifications.slice(0, 5).map((n) => (
                      <li 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n.id, n.isRead)} 
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 items-start ${!n.isRead ? "bg-blue-50/40" : ""}`}
                      >
                        <div className="mt-1">{getIcon(n.type)}</div>
                        <div className="flex-1">
                          <p className={`text-sm leading-tight ${!n.isRead ? "font-bold text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{n.message}</p>
                        </div>
                        {!n.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5" />}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Link to={`/${user?.role}/notifications`} onClick={() => setShowNotif(false)} className="block p-4 text-center text-[10px] font-black text-blue-600 hover:bg-blue-50 uppercase tracking-widest border-t border-gray-50">
                View All Notifications
              </Link>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-gray-100 mx-1" />

        {/* User Profile Dropdown */}
        {user && (
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-gray-50 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-black text-gray-800 leading-none">{user.fullName.split(" ")[0]}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{user.role}</span>
              </div>
              <FaChevronDown className={`text-[10px] text-gray-400 transition-transform ${showProfile ? "rotate-180" : ""}`} />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-3 w-56 bg-white shadow-2xl rounded-[1.25rem] overflow-hidden border border-gray-100 py-2 animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="px-5 py-3 border-b border-gray-50 mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Signed in as</p>
                  <p className="text-sm font-black text-gray-900 truncate">{user.email}</p>
                </div>
                
                <Link to={`/${user.role}/profile`} onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  <FaUser className="text-gray-400" /> My Profile
                </Link>
                <Link to={`/${user.role}/settings`} onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  <FaCog className="text-gray-400" /> Settings
                </Link>
                
                <div className="h-[1px] bg-gray-50 my-2 mx-5" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;