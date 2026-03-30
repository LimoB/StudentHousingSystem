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
  HiOutlineEye
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

  // Sync with backend on component mount
  useEffect(() => {
    dispatch(fetchMyNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this notification?")) {
      dispatch(deleteNotificationAction(id));
    }
  };

  const handleNavigate = (n: any) => {
    if (!n.isRead) handleMarkAsRead(n.id);
    // Use the link from the backend if available, otherwise default to role dashboard
    if (n.link) {
      navigate(n.link);
    } else {
      navigate(`/${user?.role}/dashboard`);
    }
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
        return <HiOutlineInformationCircle className="text-blue-500" />;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
              <HiOutlineBell className="text-2xl" />
            </div>
            Notifications
          </h1>
          <p className="text-gray-500 font-bold mt-2 text-sm uppercase tracking-wide">
            {notifications.filter(n => !n.isRead).length} Unread Messages
          </p>
        </div>
        
        {/* Mark All as Read - You can implement a bulk service later */}
        <button 
          onClick={() => notifications.forEach(n => !n.isRead && handleMarkAsRead(n.id))}
          className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`group p-6 rounded-[2.5rem] border transition-all duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center ${
              n.isRead 
                ? 'bg-gray-50/50 border-gray-100' 
                : 'bg-white border-blue-100 shadow-xl shadow-blue-50/50 ring-1 ring-blue-50'
            }`}
          >
            {/* Icon Box */}
            <div className={`p-5 rounded-3xl text-3xl transition-transform group-hover:scale-110 duration-300 ${
              n.isRead ? 'bg-white text-gray-400' : 'bg-blue-50 shadow-inner'
            }`}>
              {getNotificationIcon(n.type)}
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-lg leading-tight ${n.isRead ? 'font-bold text-gray-500' : 'font-black text-gray-900'}`}>
                  {n.title}
                </h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter whitespace-nowrap bg-gray-100 px-2 py-1 rounded-md">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className={`text-sm mt-1 leading-relaxed ${n.isRead ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                {n.message}
              </p>
              
              {/* Actions Row */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => handleNavigate(n)}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  <HiOutlineEye className="text-sm" /> View Context
                </button>
                
                {!n.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(n.id)}
                    className="px-5 py-2 bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition"
                  >
                    Mark read
                  </button>
                )}

                <button 
                  onClick={() => handleDelete(n.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors ml-auto"
                  title="Delete"
                >
                  <HiOutlineTrash className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <div className="py-32 text-center bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <HiOutlineChatBubbleLeftRight className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-black text-xl">Inbox is Quiet</h3>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">No new alerts to show right now</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;