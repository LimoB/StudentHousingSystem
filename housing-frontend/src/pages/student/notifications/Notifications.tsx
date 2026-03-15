import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchMyNotifications, 
  markNotificationAsRead, 
  deleteNotificationAction 
} from "../../../app/slices/notificationSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import type { Notification } from "../../../api/notifications";

const Notifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
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

  if (loading) return (
    <div className="p-10 text-center">
      <div className="animate-bounce text-4xl mb-4">🔔</div>
      <p className="text-gray-500 font-medium">Checking for updates...</p>
    </div>
  );

  if (error) return <p className="p-6 text-red-500 text-center font-bold">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated on your housing status.</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
            NEW ALERTS
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100 shadow-sm">
          <p className="text-gray-400 text-lg">All caught up! No new notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n: Notification) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id, n.read)}
              className={`group relative bg-white p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                n.read 
                ? "border-gray-100 opacity-75" 
                : "border-blue-200 shadow-lg shadow-blue-50 ring-1 ring-blue-100"
              }`}
            >
              {/* Unread dot */}
              {!n.read && (
                <div className="absolute top-6 right-6 w-3 h-3 bg-blue-600 rounded-full" />
              )}

              <div className="flex flex-col gap-1 pr-8">
                <h2 className={`text-xl font-bold ${n.read ? "text-gray-600" : "text-gray-900"}`}>
                  {n.title}
                </h2>
                <p className="text-gray-500 leading-relaxed">{n.message}</p>
                
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                    {new Date(n.createdAt).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent marking as read when deleting
                      handleDelete(n.id);
                    }}
                    className="text-xs font-black text-red-300 hover:text-red-600 transition uppercase opacity-0 group-hover:opacity-100"
                  >
                    Dismiss
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

export default Notifications;