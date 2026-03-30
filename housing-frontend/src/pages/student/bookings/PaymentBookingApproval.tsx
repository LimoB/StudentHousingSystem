import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RootState, AppDispatch } from "../../../app/store";
import { startSTKPush, resetTransaction } from "../../../app/slices/paymentSlice";
import { fetchBookingById, fetchMyBookings } from "../../../app/slices/bookingSlice";
import { 
  CreditCard, 
  Phone, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  Wallet,
  ArrowRight
} from "lucide-react";

const PaymentBookingApproval: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");

  const { selectedBooking, bookings, loading: bookingLoading } = useSelector((state: RootState) => state.bookings);
  const { currentTransaction } = useSelector((state: RootState) => state.payments);
  const user = useSelector((state: RootState) => state.auth.user);

  // Check for active leases to warn user
  const alreadyHasActiveLease = bookings.some(
    (b: any) => 
      ["approved", "paid", "confirmed"].includes(b.status) && 
      b.id !== Number(bookingId)
  );

  // RESOLVED: Dependency array now includes bookings.length to satisfy ESLint
  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(Number(bookingId)));
    }
    
    if (user?.role === "student" && bookings.length === 0) {
      dispatch(fetchMyBookings());
    }

    return () => { 
      dispatch(resetTransaction()); 
    };
  }, [dispatch, bookingId, user, bookings.length]);

  useEffect(() => {
    if (currentTransaction.status === "success") {
      toast.success("Payment confirmed! Your lease is now active.");
    } else if (currentTransaction.status === "failed") {
      toast.error(currentTransaction.error || "Payment was not successful.");
    }
  }, [currentTransaction.status, currentTransaction.error]);

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = user?.userId || (user as any)?.id;

    if (!selectedBooking || !studentId) {
      toast.error("Session error: Please re-login.");
      return;
    }

    if (!phoneNumber.startsWith("254") || phoneNumber.length !== 12) {
      toast.error("Format must be 2547XXXXXXXX");
      return;
    }

    const payload = {
      phone: phoneNumber,
      amount: Number(selectedBooking.unit?.price || 1),
      bookingId: selectedBooking.id,
      studentId: studentId
    };

    const loadId = toast.loading("Sending M-Pesa prompt...");
    
    try {
      await dispatch(startSTKPush(payload)).unwrap();
      toast.success("Prompt sent! Check your phone.", { id: loadId });
    } catch (err: any) {
      toast.error(err || "Failed to initiate M-Pesa", { id: loadId });
    }
  };

  // --- UI RENDERING LOGIC ---

  // 1. Success State (Flipped immediately upon Redux update)
  if (currentTransaction.status === "success") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 relative">
            <CheckCircle2 size={48} />
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Payment Confirmed!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Your room has been secured. Your digital lease is now active in your dashboard.
          </p>
          <button 
            onClick={() => navigate("/student/leases")}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-bold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
          >
            Go to My Leases <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // 2. Initial Fetching State
  if (bookingLoading && !selectedBooking) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-slate-400 font-medium animate-pulse">Syncing booking data...</p>
      </div>
    );
  }

  // 3. Main Form
  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          disabled={currentTransaction.status === "pending"}
          className="group inline-flex items-center text-slate-400 hover:text-blue-600 font-bold transition mb-10 disabled:opacity-30"
        >
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-100 mb-4">
            <ShieldCheck size={12} /> Secure M-Pesa Gateway
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Confirm & <span className="text-blue-600">Pay.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <form onSubmit={handleInitiatePayment} className="space-y-8">
                <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-500" /> M-Pesa Details
                </h3>

                {alreadyHasActiveLease && (
                  <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-100 rounded-[1.8rem]">
                    <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <p className="text-xs text-amber-700 font-semibold">Note: You already have an active lease.</p>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Safaricom Phone Number</label>
                  <div className="relative group max-w-md">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      type="tel"
                      required
                      placeholder="2547XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={currentTransaction.status === "pending"}
                      className="w-full pl-14 pr-6 py-5 bg-[#F8FAFC] border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>

                {currentTransaction.status === "pending" ? (
                  <div className="bg-blue-600 p-8 rounded-[2rem] text-white flex items-center gap-6 animate-pulse">
                    <Loader2 className="animate-spin" size={32} />
                    <div>
                      <p className="font-black text-lg">Awaiting M-Pesa PIN...</p>
                      <p className="text-blue-100 text-sm font-medium">Please enter your PIN on the phone prompt.</p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-6">
                     <button
                      type="submit"
                      className="w-full md:w-auto px-12 py-5 bg-emerald-600 text-white rounded-[1.8rem] font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                    >
                      Confirm & Pay Now <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {currentTransaction.status === "failed" && (
                  <div className="bg-red-50 border border-red-100 p-5 rounded-[1.8rem] flex items-center gap-4 text-red-700 mt-4">
                    <AlertCircle size={24} />
                    <p className="text-xs font-bold">{currentTransaction.error || "Transaction failed."}</p>
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-6">
              <div className="bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-xl p-8 text-white relative">
                <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase mb-6">Checkout Summary</p>
                <div className="flex justify-between items-center pb-6 border-b border-slate-700/50 mb-6">
                  <span className="text-slate-400 text-sm">Total Payable</span>
                  <p className="text-2xl font-black text-white">Ksh {Number(selectedBooking?.unit?.price || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Property</span><span className="font-bold truncate max-w-[150px]">{selectedBooking?.unit?.property?.name || "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Unit</span><span className="font-bold">{selectedBooking?.unit?.unitNumber || "N/A"}</span></div>
                </div>
              </div>
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
                <Wallet className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs text-blue-600 leading-relaxed font-semibold">Your room is instantly locked upon successful payment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentBookingApproval;