import type { Booking } from "../api/bookings";
import { 
  HiOutlineCalendar, 
  HiOutlineUser, 
  HiOutlineHashtag, 
  HiOutlineCheck, 
  HiOutlineXMark, 
  HiOutlineTrash,
  HiOutlineHomeModern,
  HiOutlineShieldCheck
} from "react-icons/hi2";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

interface Props {
  booking: Booking;
  onUpdateStatus?: (status: "approved" | "rejected" | "pending") => void;
  onDelete?: () => void;
  viewOnly?: boolean; // New prop for Admin/Audit mode
}

const BookingCard: React.FC<Props> = ({ booking, onUpdateStatus, onDelete, viewOnly = false }) => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  const statusStyles: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-50/50",
    paid: "bg-blue-50 text-blue-700 border-blue-100 shadow-blue-50/50",
    confirmed: "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-50/50",
    rejected: "bg-rose-50 text-rose-700 border-rose-100 shadow-rose-50/50",
    pending: "bg-amber-50 text-amber-700 border-amber-100 shadow-amber-50/50",
  };

  return (
    <div className={`bg-white rounded-[2.5rem] border border-gray-100 p-7 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 group relative overflow-hidden`}>
      
      {/* View-Only Accent for Admins */}
      {viewOnly && (
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/20" />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
        
        {/* Left Section: Status & Identifiers */}
        <div className="space-y-6 flex-1">
          <div className="flex items-center space-x-3">
            <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm transition-all ${statusStyles[booking.status] || statusStyles.pending}`}>
              {booking.status}
            </span>
            <div className="flex items-center text-gray-300 text-[10px] font-black uppercase tracking-widest">
              <HiOutlineHashtag className="mr-1 w-3 h-3 text-gray-200" /> REF-{booking.id}
            </div>
            {viewOnly && (
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-100">
                  <HiOutlineShieldCheck className="w-3.5 h-3.5" /> System Record
               </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Info */}
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:rotate-6 transition-transform duration-300">
                <HiOutlineUser className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Applicant</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                  {booking.student?.fullName || `Student #${booking.studentId}`}
                </p>
              </div>
            </div>

            {/* Unit Info */}
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <HiOutlineHomeModern className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Asset / Unit</p>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {booking.unit?.unitNumber || "N/A"} — <span className="text-indigo-600 font-black">KES {booking.unit?.price?.toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Date Info */}
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl">
                <HiOutlineCalendar className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Reservation Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-50">
          
          {/* Operations: Only for Landlords and NOT in ViewOnly mode */}
          {!viewOnly && userRole === "landlord" && booking.status === "pending" && (
            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <button 
                onClick={() => onUpdateStatus?.("approved")}
                className="flex-1 lg:flex-none flex items-center justify-center bg-gray-900 hover:bg-blue-600 text-white px-7 py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-gray-100 hover:shadow-blue-100 active:scale-95"
              >
                <HiOutlineCheck className="mr-2 w-4 h-4 stroke-[3]" /> Approve
              </button>
              
              <button 
                onClick={() => onUpdateStatus?.("rejected")}
                className="flex-1 lg:flex-none flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-rose-600 hover:border-rose-200 px-7 py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
              >
                <HiOutlineXMark className="mr-2 w-4 h-4 stroke-[3]" /> Reject
              </button>
            </div>
          )}

          {/* Audit Mode Message */}
          {viewOnly && (
            <div className="hidden lg:flex items-center gap-3 px-6 py-4 bg-gray-50/50 rounded-[1.25rem] border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Ready for Audit</p>
            </div>
          )}

          {/* Delete Action (Cancel) - Hidden for Admins */}
          {!viewOnly && (
            <button 
              onClick={onDelete}
              className="p-4 text-gray-200 hover:text-rose-600 hover:bg-rose-50 rounded-[1.25rem] transition-all active:scale-90 ml-2"
              title="Purge Booking"
            >
              <HiOutlineTrash className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;