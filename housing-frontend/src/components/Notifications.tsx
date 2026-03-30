 
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineBell, 
  HiOutlineCheckCircle, 
  HiOutlineInformationCircle, 
  HiOutlineExclamationTriangle,
  HiOutlineChatBubbleLeftRight,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSparkles
} from "react-icons/hi2";
import { 
  fetchMyNotifications, 
  markNotificationAsRead, 
  deleteNotificationAction 
} from "../app/slices/notificationSlice";
import type { RootState, AppDispatch } from "../app/store";
import { formatDistanceToNow } from 'date-fns';

const Notifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications, loading } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(fetchMyNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Permanent delete this notification?")) {
      dispatch(deleteNotificationAction(id));
    }
  };

  /**
   * NAVIGATION SANITIZER:
   * Prevents logouts by ensuring links match the frontend's expected role-based routes.
   */
  const handleNavigate = (n: any) => {
    console.group("🚀 SYSTEM NAVIGATION DEBUG");
    console.log("Original Link:", n.link);

    if (!n.isRead) handleMarkAsRead(n.id);

    if (n.link) {
      let target = n.link;

      // 1. Role-based correction (The "Logout Fix")
      // If the link is /dashboard/my-leases, it needs to be /landlord/leases or /admin/dashboard
      if (target.startsWith('/dashboard') || target.includes('my-leases')) {
        const rolePrefix = user?.role === 'landlord' ? '/landlord' : '/admin';
        
        // Map specific generic keywords to your actual dashboard routes
        if (target.includes('leases')) {
          target = `${rolePrefix}/leases`;
        } else if (target.includes('properties')) {
          target = `${rolePrefix}/properties`;
        } else {
          target = `${rolePrefix}/dashboard`;
        }
        console.log("⚠️ Path auto-corrected to:", target);
      }

      try {
        // 2. Absolute URL protection
        if (target.startsWith('http')) {
          const url = new URL(target, window.location.origin);
          target = url.pathname + url.search + url.hash;
        }

        console.log("✅ Final Internal Navigation:", target);
        navigate(target);
      } catch (e) {
        console.error("❌ Navigation Logic Error:", e);
        navigate(target);
      }
    } else {
      navigate(`/${user?.role}/dashboard`);
    }
    console.groupEnd();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <HiOutlineCheckCircle className="text-emerald-500" />;
      case 'maintenance':
        return <HiOutlineExclamationTriangle className="text-amber-500" />;
      case 'booking':
        return <HiOutlineInformationCircle className="text-purple-500" />;
      default:
        return <HiOutlineSparkles className="text-blue-500" />;
    }
  };

  // Dynamic Theme based on role: Indigo for Admin, Blue for Landlord
  const isAdmin = user?.role === 'admin';
  const themeColor = isAdmin ? 'indigo' : 'blue';

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-5">
          <div className={`p-4 bg-${themeColor}-600 rounded-[1.5rem] text-white shadow-2xl shadow-${themeColor}-200`}>
            <HiOutlineBell className="text-3xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">System Alerts</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">
              {notifications.filter(n => !n.isRead).length} Urgent Markings Pending
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => notifications.forEach(n => !n.isRead && handleMarkAsRead(n.id))}
          className={`px-6 py-3 rounded-2xl bg-${themeColor}-50 text-${themeColor}-600 text-[10px] font-black uppercase tracking-widest border border-${themeColor}-100 hover:bg-${themeColor}-600 hover:text-white transition-all active:scale-95`}
        >
          Clear All Unread
        </button>
      </div>

      {/* LISTING AREA */}
      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-4 border-${themeColor}-600 mb-4`}></div>
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Accessing Secure Logs...</p>
          </div>
        )}

        {notifications.map((n) => (
          <div 
            key={n.id} 
            onClick={() => handleNavigate(n)}
            className={`group relative p-8 rounded-[3rem] border cursor-pointer transition-all duration-500 flex flex-col md:flex-row gap-8 items-start md:items-center ${
              n.isRead 
                ? 'bg-white border-gray-100 opacity-80' 
                : 'bg-white border-white shadow-2xl shadow-gray-200/50 hover:shadow-gray-300/50 ring-1 ring-gray-50 hover:-translate-y-1'
            }`}
          >
            {/* UNREAD GLOW EFFECT */}
            {!n.isRead && (
              <div className={`absolute top-8 left-8 w-2 h-2 rounded-full bg-${themeColor}-500 animate-ping`}></div>
            )}

            {/* ICON CONTAINER */}
            <div className={`p-6 rounded-[2rem] text-4xl transition-all group-hover:rotate-12 duration-500 ${
              n.isRead ? 'bg-gray-100 text-gray-300' : `bg-${themeColor}-50 text-${themeColor}-600 shadow-inner`
            }`}>
              {getNotificationIcon(n.type)}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className={`text-2xl tracking-tighter ${n.isRead ? 'font-bold text-gray-500' : 'font-black text-gray-900'}`}>
                  {n.title}
                </h3>
                <span className="text-[9px] font-black text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              <p className={`text-sm leading-relaxed max-w-2xl ${n.isRead ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                {n.message}
              </p>
              
              <div className="pt-6 flex items-center gap-5">
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${n.isRead ? 'text-gray-400' : `text-${themeColor}-600`}`}>
                  <HiOutlineEye className="text-lg" />
                  Explore Detail
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.id);
                  }}
                  className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all ml-auto"
                >
                  <HiOutlineTrash className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {!loading && notifications.length === 0 && (
          <div className="py-40 text-center bg-white rounded-[4rem] border border-gray-100 shadow-inner">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
              <HiOutlineChatBubbleLeftRight className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-gray-900 font-black text-2xl italic tracking-tighter">System Silence</h3>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-3">All activities acknowledged</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;