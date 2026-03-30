import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../app/store";
import { startSTKPush, resetTransaction } from "../../../app/slices/paymentSlice";
import { 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  ArrowRight, 
  Home, 
  Info 
} from "lucide-react";

const PaymentBooking: React.FC = () => {
  const { bookingId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentTransaction } = useSelector((state: RootState) => state.payments);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const bookingAmount = 1; 

  useEffect(() => {
    if (bookingId && user) {
      // Trigger the STK Push automatically on mount
      const phone = (user as any).phone || "254793539957"; 
      const studentId = (user as any).id || (user as any).userId;

      dispatch(startSTKPush({
        bookingId: Number(bookingId),
        amount: bookingAmount,
        phone: phone,
        studentId: studentId
      }));
    }

    // Cleanup when leaving the page to prevent stale states
    return () => {
      dispatch(resetTransaction());
    };
  }, [bookingId, dispatch, user]);

  // SUCCESS STATE
  if (currentTransaction.status === "success") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 p-10 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
            <CheckCircle2 size={48} />
            <div className="absolute inset-0 bg-emerald-500 rounded-3xl animate-ping opacity-20"></div>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-4">Payment Confirmed!</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Your lease is now active. Welcome to your new home!
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => navigate("/student/dashboard")}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-600 transition-all group"
            >
              Go to Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/student/bookings")}
              className="w-full py-5 bg-slate-50 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
            >
              <Home size={18} /> View My Lease
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PENDING, FAILED, OR INITIALIZING STATES
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {currentTransaction.status === "pending" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="text-blue-500" size={40} />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">Waiting for M-Pesa...</h2>
              <p className="text-slate-500 font-medium px-6">
                Please check your phone and enter your <span className="text-slate-900 font-bold">M-Pesa PIN</span> to complete the transaction.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase">
              <Loader2 size={12} className="animate-spin" /> Syncing with Safaricom
            </div>
          </div>
        ) : currentTransaction.status === "failed" ? (
          <div className="bg-white p-10 rounded-[3rem] border border-red-100 shadow-xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
            <p className="text-slate-500 mb-8">{currentTransaction.error || "The transaction was cancelled or timed out."}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-slate-300" size={40} />
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Initializing Secure Payment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentBooking;