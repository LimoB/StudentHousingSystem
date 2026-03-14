// import React from "react";
import type { Booking } from "../api/bookings";

interface Props {
  booking: Booking;
  onDelete?: () => void;
}

const BookingCard: React.FC<Props> = ({ booking, onDelete }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 border">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-lg">
          Booking #{booking.id}
        </h2>

        <span
          className={`px-3 py-1 rounded text-sm ${
            booking.status === "approved"
              ? "bg-green-100 text-green-700"
              : booking.status === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {booking.status}
        </span>
      </div>

      <p>
        <strong>Unit:</strong> {booking.unitId}
      </p>

      <p>
        <strong>Student:</strong> {booking.studentId}
      </p>

      <p>
        <strong>Created:</strong>{" "}
        {new Date(booking.createdAt).toLocaleDateString()}
      </p>

      {onDelete && (
        <button
          onClick={onDelete}
          className="mt-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default BookingCard;