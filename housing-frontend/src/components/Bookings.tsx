/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchLandlordBookings, 
  fetchMyBookings, 
  fetchBookings, 
  deleteBookingAction, 
  updateBookingStatusAction,
  clearSelectedBooking
} from "../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../app/store";
import BookingCard from "./BookingCard";
import { 
  HiOutlineInboxStack, 
  HiOutlineArrowPath, 
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentList
} from "react-icons/hi2";
import toast from "react-hot-toast";

const Bookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, error } = useSelector((state: RootState) => state.bookings);
  const user = useSelector((state: RootState) => state.auth.user);

  const isAdmin = user?.role === "admin";
  const isLandlord = user?.role === "landlord";
  const isStudent = user?.role === "student";

  // 1. Move function ABOVE useEffect and wrap in useCallback
  const handleRefresh = useCallback(() => {
    if (isAdmin) dispatch(fetchBookings());
    else if (isLandlord) dispatch(fetchLandlordBookings());
    else if (isStudent) dispatch(fetchMyBookings());
  }, [dispatch, isAdmin, isLandlord, isStudent]);

  // 2. Now useEffect can safely call handleRefresh
  useEffect(() => {
    if (!user) return;
    dispatch(clearSelectedBooking());
    handleRefresh();
  }, [dispatch, user.role, handleRefresh, user]); 

  /**
   * ROLE-BASED FILTERING
   */
  const filteredBookings = useMemo(() => {
    if (!user || !bookings) return [];
    
    if (isAdmin || isStudent) return bookings;
    
    const currentUserId = (user as any).id || (user as any).userId;

    if (isLandlord) {
      return bookings.filter((b) => {
        const landlordIdInBooking = b.unit?.property?.landlordId || (b.unit?.property as any)?.landlord?.id;
        return Number(landlordIdInBooking) === Number(currentUserId);
      });
    }

    return bookings; 
  }, [bookings, user, isAdmin, isLandlord, isStudent]);

  const handleUpdateStatus = async (id: number, status: string) => {
    if (isAdmin) {
      toast.error("Admins cannot modify booking statuses.");
      return;
    }

    const loadingToast = toast.loading(`Updating status to ${status}...`);
    try {
      const result = await dispatch(updateBookingStatusAction({ id, status: status as any }));
      if (updateBookingStatusAction.fulfilled.match(result)) {
        toast.success(`Booking ${status} successfully`, { id: loadingToast });
      } else {
        toast.error(`Error: ${result.payload || "Failed to update"}`, { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network synchronization failed", { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (isAdmin) {
       toast.error("System records are protected.");
       return;
    }

    if (!window.confirm("Are you sure? This action will permanently remove the application record.")) return;
    
    const loadingToast = toast.loading("Purging record...");
    try {
      const result = await dispatch(deleteBookingAction(id));
      if (deleteBookingAction.fulfilled.match(result)) {
        toast.success("Deleted successfully", { id: loadingToast });
      }
    } catch (err) {
      toast.error("An error occurred during deletion", { id: loadingToast });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
              <HiOutlineClipboardDocumentList className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
              {isAdmin ? "Global Registry" : isLandlord ? "Booking Requests" : "My Applications"}
            </h1>
          </div>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] ml-11">
             {isAdmin ? `Monitoring ${filteredBookings.length} system-wide applications` :
              isLandlord ? `Managing ${filteredBookings.length} pending requests` :
              "Track your hostel application status in real-time"}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2 bg-white border border-purple-100 px-4 py-3 rounded-2xl text-purple-600 font-black text-[10px] uppercase tracking-widest shadow-sm">
              <HiOutlineShieldCheck className="w-4 h-4" /> Audit Access
            </div>
          )}
          <button 
            onClick={handleRefresh} 
            className="p-4 bg-white border border-gray-100 rounded-2xl hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95"
          >
            <HiOutlineArrowPath className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-100 text-red-600 p-6 rounded-[1.5rem] flex items-center justify-between">
          <p className="font-bold text-sm">{error}</p>
          <button onClick={() => dispatch(clearSelectedBooking())} className="text-[10px] font-black uppercase tracking-widest underline">Dismiss</button>
        </div>
      )}

      {loading && filteredBookings.length === 0 ? (
        <div className="py-32 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Syncing Global Ledger...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-[3rem] py-24 text-center border border-gray-100 shadow-sm">
          <HiOutlineInboxStack className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h2 className="text-xl font-black text-gray-900 uppercase">Registry Empty</h2>
          <p className="text-gray-400 font-bold text-sm">No active booking requests found.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              viewOnly={isAdmin}
              onUpdateStatus={!isStudent && !isAdmin ? (status) => handleUpdateStatus(booking.id, status) : undefined}
              onDelete={!isAdmin ? () => handleDelete(booking.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;