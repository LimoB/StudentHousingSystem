import { useEffect, useMemo } from "react"; // Added React import for standard practice
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchLandlordBookings, 
  fetchMyBookings, 
  deleteBookingAction, 
  updateBookingStatusAction,
  clearSelectedBooking
} from "../../../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import BookingCard from "../../../components/BookingCard";
import { HiOutlineInboxStack, HiOutlineArrowPath } from "react-icons/hi2";
import toast from "react-hot-toast";

const Bookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, error } = useSelector((state: RootState) => state.bookings);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    console.log("--- Bookings Component Mounted ---");
    
    if (!user) {
      console.warn("No user found in Redux state. Skipping fetch.");
      return;
    }

    // Reset stale errors from previous views
    dispatch(clearSelectedBooking());

    if (user.role === "student") {
      dispatch(fetchMyBookings());
    } else if (user.role === "landlord") {
      dispatch(fetchLandlordBookings());
    }
    // Added 'user' to dependencies to satisfy exhaustive-deps while keeping logic sound
  }, [dispatch, user]); 

  /**
   * UI SAFETY FILTER
   */
  const filteredBookings = useMemo(() => {
    if (!user || user.role === "admin") return bookings;
    
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
    const loadingToast = toast.loading(`Setting status to ${status}...`);
    
    try {
      const result = await dispatch(updateBookingStatusAction({ id, status: status as any }));
      if (updateBookingStatusAction.fulfilled.match(result)) {
        toast.success(`Booking ${status} successfully`, { id: loadingToast });
      } else {
        toast.error(`Error: ${result.payload || "Failed to update"}`, { id: loadingToast });
      }
    } catch (err) {
      console.error("Critical error in handleUpdateStatus:", err);
      toast.error("An error occurred", { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this booking record?")) return;
    
    const loadingToast = toast.loading("Removing record...");
    try {
      const result = await dispatch(deleteBookingAction(id));
      if (deleteBookingAction.fulfilled.match(result)) {
        toast.success("Booking record removed", { id: loadingToast });
      } else {
        toast.error("Failed to remove", { id: loadingToast });
      }
    } catch (err) {
      console.error("Critical error in handleDelete:", err);
      toast.error("An error occurred", { id: loadingToast });
    }
  };

  // Fixed ESLint expression error by wrapping logic in a proper block
  const handleRefresh = () => {
    console.log("Manual Refresh Triggered");
    if (user?.role === 'landlord') {
      dispatch(fetchLandlordBookings());
    } else {
      dispatch(fetchMyBookings());
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {user?.role === "landlord" ? "Booking Requests" : "My Applications"}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {user?.role === "landlord" 
              ? `Managing ${filteredBookings.length} incoming requests for your properties.` 
              : "Track the real-time status of your hostel bookings."}
          </p>
        </div>
        
        <button 
          onClick={handleRefresh}
          className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:shadow-md transition-all active:scale-95"
          title="Refresh Data"
        >
          <HiOutlineArrowPath className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-100 text-red-600 p-5 rounded-3xl font-bold text-sm flex items-center justify-between">
          <div className="flex items-center">
             <span className="mr-2">⚠️ Error:</span> {error}
          </div>
          <button 
            onClick={() => dispatch(clearSelectedBooking())} 
            className="text-[10px] uppercase bg-white px-3 py-1 rounded-full shadow-sm hover:bg-red-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading && filteredBookings.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600 border-opacity-20 border-t-blue-600 mb-6"></div>
          <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Syncing Records...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-[3rem] py-24 text-center border border-gray-100 shadow-sm animate-in fade-in zoom-in duration-500">
          <HiOutlineInboxStack className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-gray-900">No Bookings Found</h2>
          <p className="text-gray-400 font-medium mt-2 max-w-xs mx-auto">
            {user?.role === "landlord" 
              ? "When students book your units, they will appear here for approval." 
              : "You haven't made any bookings yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdateStatus={(status) => handleUpdateStatus(booking.id, status)}
              onDelete={() => handleDelete(booking.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;