import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPayments } from "../app/slices/paymentSlice";
import { RootState, AppDispatch } from "../app/store";
import { 
  HiOutlineBanknotes, 
  HiOutlineCheckCircle, 
  HiOutlineClock, 
  HiOutlineExclamationCircle,
  HiOutlineArrowPath
} from "react-icons/hi2";
import { format } from "date-fns";

// Define the interface clearly
interface Payment {
  id: number;
  amount: string;
  status: string; 
  phone: string;
  mpesaReceiptNumber?: string;
  checkoutRequestID: string;
  createdAt: string;
  student?: { fullName: string };
  booking?: {
    unit?: {
      unitNumber: string;
      property?: {
        title: string;
        landlordId: number;
      };
    };
  };
}

const PaymentDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // FIX: Convert to unknown first to bypass WritableNonArrayDraft mismatch
  // Also removed 'error' from destructuring to satisfy ESLint
  const { payments, loading } = useSelector((state: RootState) => state.payments) as unknown as { 
    payments: Payment[], 
    loading: boolean 
  };
  
  // Cast user to any to bypass the .id property error
  const user = useSelector((state: RootState) => state.auth.user) as any;

  useEffect(() => {
    dispatch(fetchAllPayments());
  }, [dispatch]);

  /**
   * FRONTEND FILTERING
   */
  const filteredPayments = useMemo(() => {
    if (user?.role === "landlord") {
      return payments.filter((payment) => {
        const landlordId = payment.booking?.unit?.property?.landlordId;
        return Number(landlordId) === Number(user?.id);
      });
    }
    return payments; 
  }, [payments, user]);

  /**
   * DERIVED STATS
   */
  const totalRevenue = useMemo(() => 
    filteredPayments
      .filter((p) => {
        const s = p.status?.toLowerCase();
        return s === "paid" || s === "success";
      })
      .reduce((sum, p) => sum + parseFloat(p.amount), 0)
  , [filteredPayments]);

  const pendingCount = useMemo(() => 
    filteredPayments.filter((p) => p.status?.toLowerCase() === "pending").length
  , [filteredPayments]);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "success": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "pending": return "bg-amber-50 text-amber-700 border-amber-100";
      case "failed": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {user?.role === "admin" ? "Financial Overview" : "Property Revenue"}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {user?.role === "admin" 
              ? "Monitoring all system-wide transactions." 
              : "Tracking payments for your managed units."}
          </p>
        </div>
        <button 
          onClick={() => dispatch(fetchAllPayments())}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:text-blue-600 hover:shadow-sm transition-all active:scale-95 font-bold text-sm"
        >
          <HiOutlineArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <HiOutlineBanknotes className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Total Collected</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">
            KES {totalRevenue.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <HiOutlineCheckCircle className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Successful</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">
            {filteredPayments.filter(p => ["paid", "success"].includes(p.status?.toLowerCase())).length}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <HiOutlineClock className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Pending</p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">
            {pendingCount} Requests
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property & Unit</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <HiOutlineExclamationCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No records found for your account.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{payment.student?.fullName || "Student"}</span>
                        <span className="text-xs text-gray-400 font-medium">{payment.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">{payment.booking?.unit?.property?.title || "N/A"}</span>
                        <span className="text-xs text-blue-500 font-black">Unit {payment.booking?.unit?.unitNumber || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-black text-gray-900 italic">
                      KES {parseFloat(payment.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right text-xs text-gray-400 font-bold">
                      {payment.createdAt ? format(new Date(payment.createdAt), "MMM d, yyyy") : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;