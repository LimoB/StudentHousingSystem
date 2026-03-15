import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchBookings,
  fetchMyBookings,
  deleteBookingAction,
} from "../../../app/slices/bookingSlice";

import type { RootState, AppDispatch } from "../../../app/store";
import type { Booking } from "../../../api/bookings";

const Bookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

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
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      dispatch(deleteBookingAction(id));
    }
  };

  const handlePayment = (bookingId: number) => {
    // Navigate to a payment/checkout page
    navigate(`/student/payment/${bookingId}`);
  };

  if (loading) return (
    <div className="p-10 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-500">Loading your bookings...</p>
    </div>
  );

  if (error) return <p className="p-6 text-red-500 font-bold text-center">{error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          {user?.role === "student" ? "My Bookings" : "Property Bookings"}
        </h1>
        <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-bold border border-blue-100">
          {bookings.length} Total
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-100">
          <p className="text-gray-400 text-lg">No bookings found in your history.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking: any) => (
            <div 
              key={booking.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
            >
              {/* Info Section */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {booking.unit?.property?.name || "Apartment Unit"}
                  </h3>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                    booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">
                  Room: <span className="text-gray-900">{booking.unit?.unitNumber || "N/A"}</span>
                </p>
                <p className="text-blue-600 font-bold mt-1">
                  Ksh {Number(booking.unit?.price || 0).toLocaleString()}
                </p>
              </div>

              {/* Date Section */}
              <div className="text-sm text-gray-400">
                <p>Booked on:</p>
                <p className="font-bold text-gray-600">
                  {new Date(booking.createdAt).toLocaleDateString('en-GB')}
                </p>
              </div>

              {/* Actions Section */}
              <div className="flex items-center gap-3">
                {user?.role === "student" && booking.status === "pending" && (
                  <button
                    onClick={() => handlePayment(booking.id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100"
                  >
                    Pay to Approve
                  </button>
                )}

                <button
                  onClick={() => handleDelete(booking.id)}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;