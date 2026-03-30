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
import { HiOutlineBell, HiOutlineTrash, HiOutlineEye, HiOutlineInbox } from "react-icons/hi2";

const StudentNotifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { notifications, loading, error } = useSelector(
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
    if (window.confirm("Remove this notification?")) {
      dispatch(deleteNotificationAction(id));
    }
  };

  const handleAction = (n: any) => {
    handleMarkRead(n.id, n.isRead);
    if (n.link) {
      navigate(n.link);
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing updates...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center">
      <p className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold border border-red-100">{error}</p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <HiOutlineBell className="text-blue-600" />
            Inbox
          </h1>
          <p className="text-gray-500 font-medium mt-1">Updates on your bookings and payments.</p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl border border-blue-100">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-widest">New Alerts</span>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-gray-50/50 p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
          <HiOutlineInbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-black uppercase text-sm tracking-widest">Your inbox is clear!</p>
          <p className="text-gray-400 text-xs mt-2 font-medium">We'll notify you here when things change.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 ${
                n.isRead 
                ? "bg-white border-gray-100 opacity-80" 
                : "bg-white border-blue-200 shadow-2xl shadow-blue-100/50 ring-1 ring-blue-50"
              }`}
            >
              {/* Unread Status Ribbon */}
              {!n.isRead && (
                <div className="absolute -top-3 -left-3 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-xl shadow-lg shadow-blue-200 uppercase tracking-widest">
                  Unread
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h2 className={`text-2xl font-black tracking-tight ${n.isRead ? "text-gray-600" : "text-gray-900"}`}>
                    {n.title}
                  </h2>
                  <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-lg">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <p className={`text-base leading-relaxed ${n.isRead ? "text-gray-400 font-medium" : "text-gray-600 font-semibold"}`}>
                  {n.message}
                </p>
                
                <div className="flex items-center gap-4 mt-6">
                  <button 
                    onClick={() => handleAction(n)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 hover:shadow-blue-200"
                  >
                    <HiOutlineEye className="text-sm" /> View Update
                  </button>
                  
                  {!n.isRead && (
                    <button 
                      onClick={() => handleMarkRead(n.id, n.isRead)}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      Mark as read
                    </button>
                  )}

                  <button 
                    onClick={() => handleDelete(n.id)}
                    className="ml-auto p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <HiOutlineTrash className="text-xl" />
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