import { useEffect, useMemo, useCallback } from "react";
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

const PaymentDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 1. SELECTORS
  const { payments, loading, error: paymentError } = useSelector((state: RootState) => state.payments);
  const auth = useSelector((state: RootState) => state.auth) as any;
  const user = auth?.user;
  
  // FIX: If isAuthenticated is undefined in Redux, we derive it from the presence of the user
  const isAuthenticated = auth?.isAuthenticated || !!user;

  const currentUserId = user?.userId || user?.id;

  // 2. DEBUG LOGGING
  useEffect(() => {
    console.log("🛠️ [Dashboard] Auth Object from Redux:", auth);
    console.log("🛠️ [Dashboard] Derived Authenticated Status:", isAuthenticated);
    console.log("🛠️ [Dashboard] Payments in Store:", payments?.length || 0);
  }, [auth, isAuthenticated, payments]);

  const handleSync = useCallback(() => {
    // We allow sync if isAuthenticated is true OR if we have a valid user object
    if (isAuthenticated || user) {
      console.log("🚀 [Action] Condition met. Dispatching fetchAllPayments...");
      dispatch(fetchAllPayments());
    } else {
      console.warn("⚠️ [Action] Sync still blocked. Both isAuthenticated and user are empty.");
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    handleSync();
  }, [handleSync]);

  // 3. DISPLAY LOGIC
  const displayPayments = useMemo(() => {
    if (!payments || !Array.isArray(payments)) return [];
    return payments; 
  }, [payments]);

  const stats = useMemo(() => {
    const paid = displayPayments.filter((p: any) => 
      ["paid", "success", "completed"].includes(p.status?.toLowerCase())
    );
    const revenue = paid.reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);
    const pending = displayPayments.filter((p: any) => p.status?.toLowerCase() === "pending").length;
    return { revenue, paidCount: paid.length, pendingCount: pending };
  }, [displayPayments]);

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (["paid", "success", "completed"].includes(s)) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {user?.role === "admin" ? "Platform Finance" : "Revenue Dashboard"}
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">
             Logged in: <span className="font-bold text-blue-600">{user?.email || "Unknown User"}</span> (ID: {currentUserId})
          </p>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:shadow-sm transition-all active:scale-95 font-bold text-sm"
        >
          <HiOutlineArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Syncing..." : "Sync Records"}
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<HiOutlineBanknotes />} label="Revenue" value={`KES ${stats.revenue.toLocaleString()}`} color="blue" />
        <StatCard icon={<HiOutlineCheckCircle />} label="Paid" value={stats.paidCount.toString()} color="emerald" />
        <StatCard icon={<HiOutlineClock />} label="Pending" value={stats.pendingCount.toString()} color="amber" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tenant</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property / Unit</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayPayments.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <HiOutlineExclamationCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">No payments found.</p>
                    {paymentError && <p className="text-rose-400 text-xs mt-2">{paymentError}</p>}
                  </td>
                </tr>
              ) : (
                displayPayments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{p.student?.fullName || "Tenant"}</span>
                        <span className="text-[11px] text-gray-400 font-medium">{p.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">
                          {p.booking?.unit?.property?.name || "Managed Property"}
                        </span>
                        <span className="text-[11px] text-blue-500 font-black">
                          UNIT {p.booking?.unit?.unitNumber || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-black text-gray-900">KES {parseFloat(p.amount).toLocaleString()}</td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border inline-block ${getStatusStyle(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right text-xs text-gray-400 font-bold">
                      {p.createdAt ? format(new Date(p.createdAt), "MMM dd, yyyy") : "---"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {loading && <div className="p-10 text-center text-gray-400 font-bold animate-pulse uppercase text-xs">Syncing Ledger...</div>}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-gray-200">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
      color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
    }`}>
      {icon}
    </div>
    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
  </div>
);

export default PaymentDashboard;