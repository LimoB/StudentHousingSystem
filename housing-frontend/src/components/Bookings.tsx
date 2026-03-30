/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchLandlordBookings, 
  fetchMyBookings, 
  fetchBookings, // Ensure this is exported from your slice for Admin
  deleteBookingAction, 
  updateBookingStatusAction,
  clearSelectedBooking
} from "../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../app/store";
import BookingCard from "./BookingCard";
import { HiOutlineInboxStack, HiOutlineArrowPath } from "react-icons/hi2";
import toast from "react-hot-toast";

const Bookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, error } = useSelector((state: RootState) => state.bookings);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user) return;

    dispatch(clearSelectedBooking());

    // Role-based data fetching
    if (user.role === "admin") {
      dispatch(fetchBookings());
    } else if (user.role === "landlord") {
      dispatch(fetchLandlordBookings());
    } else if (user.role === "student") {
      dispatch(fetchMyBookings());
    }
  }, [dispatch, user]); 

  /**
   * UI FILTERING
   * Admin: Sees all (no filter)
   * Landlord: Sees bookings for their property IDs
   */
  const filteredBookings = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin" || user.role === "student") return bookings;
    
    const currentUserId = (user as any).id || (user as any).userId;

    if (user.role === "landlord") {
      return bookings.filter((b) => {
        const landlordIdInBooking = (b.unit?.property as any)?.landlordId;
        return Number(landlordIdInBooking) === Number(currentUserId);
      });
    }

    return bookings; 
  }, [bookings, user]);

  const handleUpdateStatus = async (id: number, status: string) => {
    const loadingToast = toast.loading(`Updating status to ${status}...`);
    try {
      const result = await dispatch(updateBookingStatusAction({ id, status: status as any }));
      if (updateBookingStatusAction.fulfilled.match(result)) {
        toast.success(`Booking ${status} successfully`, { id: loadingToast });
      } else {
        toast.error(`Error: ${result.payload || "Failed to update"}`, { id: loadingToast });
      }
    } catch (err) {
      toast.error("An error occurred", { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      const result = await dispatch(deleteBookingAction(id));
      if (deleteBookingAction.fulfilled.match(result)) {
        toast.success("Deleted successfully", { id: loadingToast });
      }
    } catch (err) {
      toast.error("An error occurred", { id: loadingToast });
    }
  };

  const handleRefresh = () => {
    if (user?.role === 'admin') dispatch(fetchBookings());
    else if (user?.role === 'landlord') dispatch(fetchLandlordBookings());
    else dispatch(fetchMyBookings());
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {user?.role === "admin" ? "System Bookings" : 
             user?.role === "landlord" ? "Booking Requests" : "My Applications"}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
             {user?.role === "admin" ? `Total system volume: ${filteredBookings.length} bookings.` :
              user?.role === "landlord" ? `Managing ${filteredBookings.length} requests for your properties.` :
              "Track your hostel application status."}
          </p>
        </div>
        
        <button onClick={handleRefresh} className="p-4 bg-white border rounded-2xl hover:text-blue-600 transition-all">
          <HiOutlineArrowPath className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex justify-between">
          <span>{error}</span>
          <button onClick={() => dispatch(clearSelectedBooking())} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {loading && filteredBookings.length === 0 ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Syncing...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-[2rem] py-20 text-center border shadow-sm">
          <HiOutlineInboxStack className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">No Bookings</h2>
          <p className="text-gray-400">Nothing to show right now.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              // Allow Admin/Landlord to update, but maybe disable for students
              onUpdateStatus={user?.role !== "student" ? (status) => handleUpdateStatus(booking.id, status) : undefined}
              onDelete={() => handleDelete(booking.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;