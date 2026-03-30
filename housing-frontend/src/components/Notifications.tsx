// import React from 'react';
import { 
  HiOutlineBell, 
  HiOutlineCheckCircle, 
  HiOutlineInformationCircle, 
  HiOutlineExclamationTriangle,
  HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'payment',
    title: 'New Payment Received',
    message: 'Tenant John Doe paid KES 45,000 for Unit #402.',
    time: '2 mins ago',
    read: false,
    icon: <HiOutlineCheckCircle className="text-emerald-500" />
  },
  {
    id: 2,
    type: 'maintenance',
    title: 'Urgent Repair Request',
    message: 'Leaking pipe reported in Green Valley Apts, Unit #12.',
    time: '1 hour ago',
    read: false,
    icon: <HiOutlineExclamationTriangle className="text-amber-500" />
  },
  {
    id: 3,
    type: 'system',
    title: 'System Update',
    message: 'The housing portal will undergo maintenance at 2:00 AM.',
    time: '5 hours ago',
    read: true,
    icon: <HiOutlineInformationCircle className="text-blue-500" />
  }
];

const Notifications: React.FC = () => {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <HiOutlineBell className="text-blue-600" />
            Notifications
          </h1>
          <p className="text-gray-500 font-medium mt-1">Stay updated with the latest activity.</p>
        </div>
        <button className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_NOTIFICATIONS.map((n) => (
          <div 
            key={n.id} 
            className={`p-6 rounded-[2rem] border transition-all hover:shadow-md cursor-pointer flex gap-5 items-start ${
              n.read ? 'bg-white border-gray-100 opacity-75' : 'bg-white border-blue-100 shadow-sm ring-1 ring-blue-50'
            }`}
          >
            <div className={`p-4 rounded-2xl bg-gray-50 text-2xl`}>
              {n.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-black text-gray-900">{n.title}</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{n.time}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 font-medium">{n.message}</p>
              
              {!n.read && (
                <div className="mt-4 flex gap-2">
                   <button className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg">View Detail</button>
                   <button className="px-4 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-lg">Dismiss</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {MOCK_NOTIFICATIONS.length === 0 && (
          <div className="py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <HiOutlineChatBubbleLeftRight className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Your inbox is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;