import type { Booking } from "../api/bookings";
import { 
  HiOutlineCalendar, 
  HiOutlineUser, 
  HiOutlineHashtag, 
  HiOutlineCheck, 
  HiOutlineXMark, 
  HiOutlineTrash,
  HiOutlineHomeModern
} from "react-icons/hi2";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

interface Props {
  booking: Booking;
  onUpdateStatus?: (status: "approved" | "rejected" | "pending") => void;
  onDelete?: () => void;
}

const BookingCard: React.FC<Props> = ({ booking, onUpdateStatus, onDelete }) => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  // Expanded status styles to handle payment states
  const statusStyles: Record<string, string> = {
    approved: "bg-green-50 text-green-700 border-green-100",
    paid: "bg-blue-50 text-blue-700 border-blue-100",
    confirmed: "bg-indigo-50 text-indigo-700 border-indigo-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:border-blue-50 transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        
        {/* Left Section: Status & Identifiers */}
        <div className="space-y-5 flex-1">
          <div className="flex items-center space-x-3">
            <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${statusStyles[booking.status] || statusStyles.pending}`}>
              {booking.status}
            </span>
            <div className="flex items-center text-gray-300 text-[10px] font-black uppercase tracking-tighter">
              <HiOutlineHashtag className="mr-1 w-3 h-3" /> B-REF-{booking.id}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Info */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                <HiOutlineUser className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Applicant</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                  {booking.student?.fullName || `Student #${booking.studentId}`}
                </p>
              </div>
            </div>

            {/* Unit Info */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <HiOutlineHomeModern className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target Unit</p>
                <p className="text-sm font-bold text-gray-900">
                  {booking.unit?.unitNumber || "N/A"} — <span className="text-indigo-600">KES {booking.unit?.price?.toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Date Info */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl">
                <HiOutlineCalendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Move-in Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-50">
          {userRole === "landlord" && booking.status === "pending" && (
            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <button 
                onClick={() => onUpdateStatus?.("approved")}
                className="flex-1 lg:flex-none flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
              >
                <HiOutlineCheck className="mr-2 w-4 h-4 stroke-[3]" /> Approve
              </button>
              
              <button 
                onClick={() => onUpdateStatus?.("rejected")}
                className="flex-1 lg:flex-none flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                <HiOutlineXMark className="mr-2 w-4 h-4 stroke-[3]" /> Reject
              </button>
            </div>
          )}

          {/* Delete Action (Cancel) */}
          <button 
            onClick={onDelete}
            className="p-4 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all ml-2"
            title="Remove Booking"
          >
            <HiOutlineTrash className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;