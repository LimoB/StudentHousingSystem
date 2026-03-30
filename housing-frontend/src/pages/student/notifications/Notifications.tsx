 
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  fetchMyNotifications, 
  markNotificationAsRead, 
  deleteNotificationAction 
} from "../../../app/slices/notificationSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import { formatDistanceToNow } from 'date-fns';
import { 
  HiOutlineBell, 
  HiOutlineTrash, 
  HiOutlineEye, 
  HiOutlineInbox, 
  HiOutlineCheckCircle, 
  HiOutlineSparkles 
} from "react-icons/hi2";

const StudentNotifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications, loading } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchMyNotifications());
  }, [dispatch]);

  const handleMarkRead = (id: number, isRead: boolean) => {
    if (!isRead) {
      dispatch(markNotificationAsRead(id));
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Permanent remove this notification?")) {
      dispatch(deleteNotificationAction(id));
    }
  };

  const handleAction = (n: any) => {
    console.group("🚀 STUDENT NAVIGATION DEBUG");
    handleMarkRead(n.id, n.isRead);

    if (n.link) {
      let target = n.link;
      if (target.includes('my-leases') || target.includes('dashboard')) {
        target = '/student/leases';
      } 

      try {
        if (target.startsWith('http')) {
          const parsed = new URL(target);
          target = parsed.pathname + parsed.search;
        }
        navigate(target);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        navigate(target);
      }
    }
    console.groupEnd();
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-400 rounded-full animate-spin mb-6" />
      <p className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px]">Updating Live Feed...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen bg-[#f8fafc]">
      {/* BRANDED HEADER: Green Gradient matching Profile */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00d991] to-[#10b981] p-10 md:p-14 rounded-[3.5rem] mb-12 shadow-2xl shadow-emerald-200/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white/20 backdrop-blur-md rounded-[2rem] border border-white/30 shadow-inner">
              <HiOutlineBell className="text-white text-4xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineSparkles className="text-emerald-100 w-5 h-5 animate-pulse" />
                <span className="text-emerald-50 font-black uppercase tracking-[0.3em] text-[10px]">Welcome Back, {user?.fullName.split(' ')[0]}!</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none">Notification Center</h1>
              <p className="text-emerald-50/80 font-medium mt-3 text-sm max-w-md">Stay updated with your housing status and recent payments.</p>
            </div>
          </div>
          
          {!loading && notifications.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/20 flex flex-col items-center">
                <span className="text-3xl font-black text-white">{notifications.filter(n => !n.isRead).length}</span>
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">New Alerts</span>
            </div>
          )}
        </div>
        
        {/* Decorative background shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[10%] w-48 h-48 bg-emerald-300/20 rounded-full blur-2xl"></div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-24 rounded-[4rem] text-center border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
            <HiOutlineInbox className="w-12 h-12 text-slate-300" />
          </div>
          <p className="text-slate-900 font-black uppercase text-lg tracking-[0.1em]">Your inbox is clear</p>
          <p className="text-slate-400 text-sm mt-2 font-medium">We'll notify you here when things change.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleAction(n)}
              className={`group relative p-8 md:p-10 rounded-[3rem] border transition-all duration-500 cursor-pointer ${
                n.isRead 
                ? "bg-white border-slate-100 opacity-90 grayscale-[0.2]" 
                : "bg-white border-emerald-100 shadow-2xl shadow-emerald-200/30 ring-1 ring-emerald-50 hover:-translate-y-2"
              }`}
            >
              {/* Top Row: Tag & Date */}
              <div className="flex justify-between items-start mb-8">
                <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] shadow-sm flex items-center gap-2 ${
                  n.isRead 
                    ? "bg-slate-100 text-slate-500" 
                    : "bg-[#00d991] text-white"
                }`}>
                  {!n.isRead && <span className="w-2 h-2 bg-white rounded-full animate-ping" />}
                  {n.isRead ? "Archived Update" : "Action Required"}
                </div>
                
                <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex flex-col gap-4">
                <h2 className={`text-3xl font-black tracking-tighter leading-tight ${n.isRead ? "text-slate-500" : "text-slate-900"}`}>
                  {n.title}
                </h2>
                
                <p className={`text-base leading-relaxed max-w-3xl ${n.isRead ? "text-slate-400 font-medium" : "text-slate-600 font-bold"}`}>
                  {n.message}
                </p>
                
                {/* Actions Bottom Bar */}
                <div className="flex items-center gap-8 mt-10 pt-8 border-t border-slate-50">
                  <div className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all group-hover:gap-5 ${n.isRead ? "text-slate-400" : "text-[#00d991]"}`}>
                    <HiOutlineEye className="text-2xl" />
                    <span>View Progress</span>
                  </div>
                  
                  {n.isRead && (
                    <div className="flex items-center gap-2 text-[11px] font-black text-emerald-500/60 uppercase tracking-widest">
                      <HiOutlineCheckCircle className="text-xl" />
                      <span>Processed</span>
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n.id);
                    }}
                    className="ml-auto p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all duration-300"
                    title="Remove"
                  >
                    <HiOutlineTrash className="text-2xl" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;