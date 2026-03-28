import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchBookings,
  fetchMyBookings,
  deleteBookingAction,
} from "../../../app/slices/bookingSlice";

import type { RootState, AppDispatch } from "../../../app/store";
import { 
  Calendar, 
  Trash2, 
  CreditCard, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  Building2,
  Clock
} from "lucide-react";

const Bookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { bookings, loading, error } = useSelector((state: RootState) => state.bookings);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.role === "student") {
      dispatch(fetchMyBookings());
    } else {
      dispatch(fetchBookings());
    }
  }, [dispatch, user]);

  const handleDelete = async (e: React.MouseEvent, booking: any) => {
    e.stopPropagation(); // Prevents navigating to details when clicking delete
    
    if (booking.payments?.length > 0) {
        toast.error("This booking has active payments and cannot be deleted.", {
            style: { borderRadius: '1rem', background: '#1f2937', color: '#fff' }
        });
        return;
    }

    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const loadId = toast.loading("Cancelling booking...");
      try {
        await dispatch(deleteBookingAction(booking.id)).unwrap();
        toast.success("Booking cancelled successfully", { id: loadId });
      } catch (err: any) {
        toast.error(err || "Failed to cancel booking", { id: loadId });
      }
    }
  };

  const handlePayment = (e: React.MouseEvent, bookingId: number) => {
    e.stopPropagation(); // Prevents navigating to details when clicking pay
    navigate(`/student/payment/${bookingId}`);
  };

  const handleNavigateToDetails = (bookingId: number) => {
    navigate(`/student/bookings/${bookingId}`);
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="text-slate-400 font-medium animate-pulse">Syncing your records...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-100 mb-4">
              <ShieldCheck size={12} /> Management Portal
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {user?.role === "student" ? "My" : "All"} <span className="text-blue-600">Bookings.</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 italic">
              Review unit reservations and lease statuses.
            </p>
          </div>
          
          <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
               <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Total</p>
              <p className="text-xl font-black text-slate-900">{bookings.length}</p>
            </div>
          </div>
        </header>

        {bookings.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="text-slate-200" size={40} />
            </div>
            <p className="text-slate-400 font-bold text-lg tracking-tight">No booking history found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {[...bookings].reverse().map((booking: any) => (
              <div 
                key={booking.id} 
                onClick={() => handleNavigateToDetails(booking.id)}
                className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-blue-300 transition-all group relative overflow-hidden cursor-pointer"
              >
                {/* Visual Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {booking.unit?.property?.name || "Premium Residence"}
                    </h3>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      booking.status === 'paid' || booking.status === 'confirmed' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-y-3 gap-x-8">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Unit</span>
                        <span className="text-slate-700 font-bold">{booking.unit?.unitNumber || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Rent</span>
                        <span className="text-blue-600 font-black">Ksh {Number(booking.unit?.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-300" />
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-tighter">
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : 'Date Pending'}
                        </span>
                      </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Payment Button */}
                  {user?.role === "student" && (booking.status === "pending" || booking.status === "approved") && !booking.payments?.length && (
                    <button
                      onClick={(e) => handlePayment(e, booking.id)}
                      className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 active:scale-95"
                    >
                      <CreditCard size={18} /> Pay Now
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(e, booking)}
                    className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  {/* Clickable Detail Chevron */}
                  <div className="hidden md:flex p-2 text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                      <ChevronRight size={28} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;