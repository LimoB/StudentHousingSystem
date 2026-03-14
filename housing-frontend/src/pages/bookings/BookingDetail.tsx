// import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchBookingById } from "../../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../../app/store";

import BookingCard from "../../components/BookingCard";
import { useEffect } from "react";

const BookingDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedBooking, loading, error } = useSelector(
    (state: RootState) => state.bookings
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchBookingById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) {
    return <p className="p-6">Loading booking details...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (!selectedBooking) {
    return <p className="p-6">Booking not found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>

      <BookingCard booking={selectedBooking} />
    </div>
  );
};

export default BookingDetail;