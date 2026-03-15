// src/components/BookingCard.tsx
import type { Booking } from "../api/bookings";
import { HiOutlineCalendar, HiOutlineUser, HiOutlineHashtag, HiOutlineCheck, HiOutlineXMark, HiOutlineTrash } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

interface Props {
  booking: Booking;
  onUpdateStatus?: (status: string) => void;
  onDelete?: () => void;
}

const BookingCard: React.FC<Props> = ({ booking, onUpdateStatus, onDelete }) => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  const statusStyles: Record<string, string> = {
    approved: "bg-green-50 text-green-700 border-green-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Main Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between md:justify-start md:space-x-4">
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyles[booking.status] || statusStyles.pending}`}>
              {booking.status}
            </span>
            <div className="flex items-center text-gray-400 text-sm font-bold">
              <HiOutlineHashtag className="mr-1" /> ID-{booking.id}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <HiOutlineUser className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Applicant ID</p>
                <p className="text-sm font-bold text-gray-900">Student #{booking.studentId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <HiOutlineCalendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Requested On</p>
                <p className="text-sm font-bold text-gray-900">{new Date(booking.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Landlord Actions */}
        <div className="flex items-center space-x-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
          {userRole === "landlord" && booking.status === "pending" && (
            <>
              <button 
                onClick={() => onUpdateStatus?.("approved")}
                className="flex-1 md:flex-none flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-black text-xs transition-all shadow-lg shadow-green-100"
              >
                <HiOutlineCheck className="mr-2 w-4 h-4" /> Approve
              </button>
              <button 
                onClick={() => onUpdateStatus?.("rejected")}
                className="flex-1 md:flex-none flex items-center justify-center bg-white border border-red-100 text-red-600 hover:bg-red-50 px-5 py-3 rounded-2xl font-black text-xs transition-all"
              >
                <HiOutlineXMark className="mr-2 w-4 h-4" /> Reject
              </button>
            </>
          )}

          {/* Delete Action (Show for student pending or landlord) */}
          <button 
            onClick={onDelete}
            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            title="Cancel Booking"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;