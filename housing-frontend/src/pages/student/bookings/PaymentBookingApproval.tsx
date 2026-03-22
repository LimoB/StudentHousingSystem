import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../app/store";
import { startSTKPush, resetTransaction } from "../../../app/slices/paymentSlice";
import { fetchBookingById } from "../../../app/slices/bookingSlice";
import { CreditCard, Phone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const PaymentBookingApproval: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");

  const { selectedBooking, loading: bookingLoading } = useSelector((state: RootState) => state.bookings);
  const { currentTransaction } = useSelector((state: RootState) => state.payments);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(Number(bookingId)));
    }
    return () => { 
      dispatch(resetTransaction()); 
    };
  }, [dispatch, bookingId]);

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = user?.userId || (user as any)?.id;

    if (!selectedBooking || !studentId) {
      alert("Session error: Please ensure you are logged in correctly.");
      return;
    }

    const payload = {
      phone: phoneNumber,
      amount: Number(selectedBooking.unit?.price || 0),
      bookingId: selectedBooking.id,
      studentId: studentId
    };

    dispatch(startSTKPush(payload));
  };

  // Move the initial loading check down so it doesn't block the Success State
  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Finalize Booking</h1>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Checkout Header */}
        <div className="bg-blue-600 p-8 text-white">
          <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Checkout Summary</p>
          <h2 className="text-2xl font-bold">{selectedBooking?.unit?.property?.name || "Unit Booking"}</h2>
          <p className="opacity-80">Unit: {selectedBooking?.unit?.unitNumber || "N/A"}</p>
          <div className="mt-6 flex justify-between items-end">
            <span className="text-sm opacity-90">Total to Pay:</span>
            <span className="text-3xl font-black">Ksh {Number(selectedBooking?.unit?.price || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-8">
          {/* PRIORITY 1: Success State */}
          {currentTransaction.status === "success" ? (
            <div className="text-center py-10">
              <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Confirmed!</h2>
              <p className="text-gray-500 mb-8">Your lease has been activated. You can now view it in your dashboard.</p>
              <button 
                onClick={() => navigate("/student/leases")}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition shadow-lg"
              >
                Go to My Leases
              </button>
            </div>
          ) : bookingLoading ? (
            /* PRIORITY 2: Initial Fetching State */
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
              <p className="mt-4 text-gray-500 font-medium">Updating booking details...</p>
            </div>
          ) : (
            /* PRIORITY 3: Payment Form */
            <form onSubmit={handleInitiatePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">M-Pesa Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    required
                    placeholder="2547XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={currentTransaction.status === "pending"}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:outline-none transition font-medium"
                  />
                </div>
              </div>

              {currentTransaction.status === "pending" && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-blue-800 font-bold">Waiting for confirmation...</p>
                    <p className="text-xs text-blue-600">Please enter your PIN on your phone.</p>
                  </div>
                </div>
              )}

              {currentTransaction.status === "failed" && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 text-red-700">
                  <AlertCircle size={24} />
                  <p className="text-sm font-bold">{currentTransaction.error || "Payment failed."}</p>
                </div>
              )}

              {currentTransaction.status !== "pending" && (
                <button
                  type="submit"
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition shadow-lg"
                >
                  <CreditCard className="mr-2 inline" size={20} />
                  Pay with M-Pesa
                </button>
              )}
            </form>
          )}

          <button 
            onClick={() => navigate(-1)}
            disabled={currentTransaction.status === "pending"}
            className="w-full mt-4 py-2 text-gray-400 text-sm font-bold hover:text-gray-600 transition disabled:opacity-30"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentBookingApproval;