import  { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchBookings,
  fetchMyBookings,
  deleteBookingAction,
} from "../../../app/slices/bookingSlice";

import type { RootState, AppDispatch } from "../../../app/store";
import BookingCard from "../../../components/BookingCard";
import type { Booking } from "../../../api/bookings";

const Bookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { bookings, loading, error } = useSelector(
    (state: RootState) => state.bookings
  );

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.role === "student") {
      dispatch(fetchMyBookings());
    } else {
      dispatch(fetchBookings());
    }
  }, [dispatch, user]);

  const handleDelete = (id: number) => {
    dispatch(deleteBookingAction(id));
  };

  if (loading) {
    return <p className="p-6">Loading bookings...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking: Booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onDelete={() => handleDelete(booking.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;