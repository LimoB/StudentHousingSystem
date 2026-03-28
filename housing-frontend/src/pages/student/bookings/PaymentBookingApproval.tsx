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

  const alreadyHasActiveLease = bookings.some(
    (b: any) => 
      (b.status === "approved" || b.status === "paid" || b.status === "confirmed") && 
      b.id !== Number(bookingId)
  );

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(Number(bookingId)));
    }
    
    if (user?.role === "student" && bookings.length <= 1) {
      dispatch(fetchMyBookings());
    }

    return () => { 
      dispatch(resetTransaction()); 
    };
  }, [dispatch, bookingId, user]);

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
      toast.error("Please use format 2547XXXXXXXX");
      return;
    }

    const payload = {
      phone: phoneNumber,
      amount: Number(selectedBooking.unit?.price || 0),
      bookingId: selectedBooking.id,
      studentId: studentId
    };

    toast.loading("Sending M-Pesa prompt...", { id: "stk-push" });
    
    try {
      await dispatch(startSTKPush(payload)).unwrap();
      toast.success("Prompt sent! Enter PIN on your phone.", { id: "stk-push" });
    } catch (err: any) {
      toast.error(err || "Failed to initiate M-Pesa", { id: "stk-push" });
    }
  };

  if (bookingLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-slate-400 font-medium animate-pulse">Syncing booking data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          disabled={currentTransaction.status === "pending"}
          className="group inline-flex items-center text-slate-400 hover:text-blue-600 font-bold transition mb-10 disabled:opacity-30"
        >
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-100 mb-4">
            <ShieldCheck size={12} /> Secure M-Pesa Gateway
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Confirm & <span className="text-blue-600">Pay.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 italic">
            Complete your transaction to activate your lease.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* LEFT COLUMN: Payment Interaction */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              
              {currentTransaction.status === "success" ? (
                <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                  <div className="bg-emerald-50 text-emerald-500 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Payment Successful!</h2>
                  <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                      Your room has been officially secured. Your digital lease is now active in your dashboard.
                  </p>
                  <button 
                    onClick={() => navigate("/student/leases")}
                    className="px-10 py-5 bg-slate-900 text-white rounded-[1.8rem] font-bold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 mx-auto"
                  >
                    Go to My Leases <ArrowRight size={20} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInitiatePayment} className="space-y-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-500" /> M-Pesa Details
                  </h3>

                  {alreadyHasActiveLease && (
                    <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-100 rounded-[1.8rem]">
                      <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Active Lease Found</p>
                        <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                          You already have an active lease. Only proceed if you are intentionally booking multiple units.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Safaricom Phone Number
                      </label>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">STK PUSH ENABLED</span>
                    </div>
                    
                    <div className="relative group max-w-md">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type="tel"
                        required
                        placeholder="2547XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={currentTransaction.status === "pending"}
                        className="w-full pl-14 pr-6 py-5 bg-[#F8FAFC] border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-inner"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 ml-1 italic">
                      <Info size={12} /> Format: 254712345678
                    </p>
                  </div>

                  {currentTransaction.status === "pending" ? (
                    <div className="bg-blue-600 p-8 rounded-[2rem] text-white flex items-center gap-6 animate-pulse">
                      <Loader2 className="animate-spin" size={32} />
                      <div>
                        <p className="font-black text-lg">Awaiting M-Pesa PIN...</p>
                        <p className="text-blue-100 text-sm font-medium">Please authorize the payment request on your phone.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-6">
                       <button
                        type="submit"
                        className="w-full md:w-auto px-12 py-5 bg-emerald-600 text-white rounded-[1.8rem] font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        Confirm & Pay Now <ChevronRight size={20} />
                      </button>
                    </div>
                  )}

                  {currentTransaction.status === "failed" && (
                    <div className="bg-red-50 border border-red-100 p-5 rounded-[1.8rem] flex items-center gap-4 text-red-700">
                      <AlertCircle size={24} className="shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Transaction Failed</p>
                        <p className="text-xs font-bold opacity-80">{currentTransaction.error || "Please try again or contact support."}</p>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (Digital Receipt) */}
          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-6">
              <div className="bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="p-8 text-white relative">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

                  <div className="relative z-10">
                    <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase mb-6">
                      Checkout Summary
                    </p>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-6 border-b border-slate-700/50">
                        <span className="text-slate-400 text-sm font-medium">
                          Total Payable
                        </span>
                        <div className="text-right">
                          <p className="text-2xl font-black text-white">
                            Ksh {Number(selectedBooking?.unit?.price || 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-end gap-1 mt-1">
                            <CheckCircle2 size={12} /> M-Pesa Secure
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Property</span>
                          <span className="text-white font-bold truncate max-w-[150px]">
                            {selectedBooking?.unit?.property?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Unit Number</span>
                          <span className="text-white font-bold">
                            {selectedBooking?.unit?.unitNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Type</span>
                          <span className="text-slate-300 font-medium">
                            {(selectedBooking?.unit as any)?.unitType || "Standard"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mt-6">
                        <div className="flex items-center gap-3 text-blue-300">
                          <CreditCard size={18} />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            Instant Confirmation
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info Message */}
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
                <div className="bg-white p-2 h-fit rounded-xl text-blue-600 shadow-sm">
                  <Wallet size={20} />
                </div>
                <p className="text-xs text-blue-600 leading-relaxed font-semibold">
                  Once your M-Pesa transaction is successful, your unit is instantly locked and your digital lease is generated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentBookingApproval;