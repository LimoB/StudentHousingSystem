// src/pages/landlord/bookings/Bookings.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings, fetchMyBookings, deleteBookingAction, updateBookingStatusAction } from "../../../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import BookingCard from "../../../components/BookingCard";
import toast from "react-hot-toast";

const Bookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, error } = useSelector((state: RootState) => state.bookings);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.role === "student") {
      dispatch(fetchMyBookings());
    } else {
      dispatch(fetchBookings());
    }
  }, [dispatch, user]);

  const handleUpdateStatus = async (id: number, status: string) => {
    const loadingToast = toast.loading(`Updating booking to ${status}...`);
    try {
      const result = await dispatch(updateBookingStatusAction({ id, status }));
      if (updateBookingStatusAction.fulfilled.match(result)) {
        toast.success(`Booking ${status} successfully`, { id: loadingToast });
      } else {
        toast.error("Status update failed", { id: loadingToast });
      }
    } catch (err) {
      toast.error("An error occurred", { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this booking?")) return;
    
    const loadingToast = toast.loading("Removing booking...");
    try {
      const result = await dispatch(deleteBookingAction(id));
      if (deleteBookingAction.fulfilled.match(result)) {
        toast.success("Booking removed", { id: loadingToast });
      } else {
        toast.error("Failed to remove", { id: loadingToast });
      }
    } catch (err) {
      toast.error("An error occurred", { id: loadingToast });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          {user?.role === "landlord" ? "Manage Requests" : "My Bookings"}
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          {user?.role === "landlord" 
            ? "Approve or reject incoming room applications." 
            : "Track the status of your hostel applications."}
        </p>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && bookings.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold">No booking requests found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
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