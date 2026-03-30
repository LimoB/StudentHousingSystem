/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPayments } from "../app/slices/paymentSlice";
import { RootState, AppDispatch } from "../app/store";
import { 
  HiOutlineBanknotes, 
  HiOutlineCheckCircle, 
  HiOutlineClock, 
  HiOutlineExclamationCircle,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineReceiptPercent,
  HiOutlineArrowDownTray
} from "react-icons/hi2";
import { format } from "date-fns";
import toast from "react-hot-toast";

const PaymentDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { payments, loading, error: paymentError } = useSelector((state: RootState) => state.payments);

  const isAdmin = user?.role === "admin";

  // 1. Data Fetching Logic (Defined before useEffect to avoid hoisting issues)
  const handleSync = useCallback(() => {
    dispatch(fetchAllPayments())
      .unwrap()
      .then(() => toast.success("Financial records synced"))
      .catch(() => toast.error("Failed to update ledger"));
  }, [dispatch]);

  useEffect(() => {
    if (user) handleSync();
  }, [handleSync, user]);

  // 2. Filter & Search Logic
  const filteredPayments = useMemo(() => {
    if (!payments || !Array.isArray(payments)) return [];
    
    return payments.filter((p: any) => {
      const searchStr = searchTerm.toLowerCase();
      const tenantName = p.student?.fullName?.toLowerCase() || "";
      const propertyName = p.booking?.unit?.property?.name?.toLowerCase() || "";
      const unitNum = p.booking?.unit?.unitNumber?.toLowerCase() || "";
      const mpesaCode = p.transactionId?.toLowerCase() || "";
      
      return tenantName.includes(searchStr) || 
             propertyName.includes(searchStr) || 
             mpesaCode.includes(searchStr) ||
             unitNum.includes(searchStr);
    });
  }, [payments, searchTerm]);

  // 3. Stats Calculation
  const stats = useMemo(() => {
    const paid = filteredPayments.filter((p: any) => 
      ["paid", "success", "completed"].includes(p.status?.toLowerCase())
    );
    const revenue = paid.reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);
    const pendingCount = filteredPayments.filter((p: any) => p.status?.toLowerCase() === "pending").length;
    
    return { revenue, paidCount: paid.length, pendingCount };
  }, [filteredPayments]);

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (["paid", "success", "completed"].includes(s)) return "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-50/50";
    if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-100 shadow-amber-50/50";
    return "bg-rose-50 text-rose-700 border-rose-100 shadow-rose-50/50";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className={`p-2.5 rounded-xl ${isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                <HiOutlineReceiptPercent className="w-6 h-6" />
             </div>
             <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
                {isAdmin ? "Global Ledger" : "Revenue Portfolio"}
             </h1>
          </div>
          <div className="flex items-center gap-3 ml-1">
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
              {isAdmin ? "System-wide financial oversight" : `Tracking performance for ${user?.email}`}
            </p>
            {isAdmin && (
              <span className="flex items-center gap-1.5 bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-100">
                <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Auditor Access
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSync}
            disabled={loading}
            className="p-4 bg-white border border-gray-100 rounded-[1.25rem] text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all active:scale-90 shadow-sm"
          >
            <HiOutlineArrowPath className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard 
          icon={<HiOutlineBanknotes />} 
          label="Total Collected" 
          value={`KES ${stats.revenue.toLocaleString()}`} 
          color={isAdmin ? "purple" : "blue"} 
        />
        <StatCard 
          icon={<HiOutlineCheckCircle />} 
          label="Verified Payments" 
          value={stats.paidCount.toString()} 
          color="emerald" 
        />
        <StatCard 
          icon={<HiOutlineClock />} 
          label="Awaiting Settlement" 
          value={stats.pendingCount.toString()} 
          color="amber" 
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="relative mb-10 group">
        <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none">
          <HiOutlineMagnifyingGlass className="w-6 h-6 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Filter by tenant, property, or M-Pesa code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-100 py-6 pl-16 pr-8 rounded-[2.5rem] text-sm font-bold text-gray-900 shadow-sm focus:ring-0 focus:border-blue-500 focus:shadow-2xl focus:shadow-blue-900/5 outline-none transition-all placeholder:text-gray-300"
        />
      </div>

      {/* Main Ledger Table */}
      <div className={`bg-white rounded-[3.5rem] border ${isAdmin ? 'border-purple-50' : 'border-gray-100'} shadow-sm overflow-hidden transition-all duration-500`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-10 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-20">No.</th>
                <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payer Identity</th>
                <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Assignment</th>
                <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Volume (KES)</th>
                <th className="px-8 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-10 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <HiOutlineExclamationCircle className="w-10 h-10 text-gray-200" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                       {paymentError ? "Ledger Desync" : "Registry Empty"}
                    </h2>
                    <p className="text-gray-400 font-bold text-sm mt-2">
                       {paymentError ? `System reported: ${paymentError}` : "No financial transactions match your query."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p: any, idx: number) => (
                  <tr key={p.id} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-10 py-7 text-center text-xs font-black text-gray-300">
                      {(idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-900 text-sm">{p.student?.fullName || "External Payer"}</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{p.transactionId || "NO_REF"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-700 text-xs">
                          {p.booking?.unit?.property?.name || "Unassigned Asset"}
                        </span>
                        <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">
                          Unit {p.booking?.unit?.unitNumber || "???"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                       <span className="font-black text-gray-900 text-sm">
                          {parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </td>
                    <td className="px-8 py-7 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border inline-block tracking-[0.1em] shadow-sm transition-all ${getStatusStyle(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-right text-[10px] text-gray-400 font-black uppercase tracking-tight">
                      {p.createdAt ? format(new Date(p.createdAt), "dd MMM yyyy • HH:mm") : "Settlement Pending"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {loading && (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-4 bg-white/80 absolute inset-0 z-10">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
               <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Reconciling System Ledger...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100/50",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100/50",
    purple: "bg-purple-50 text-purple-600 shadow-purple-100/50"
  };

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-900/5 group relative overflow-hidden">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg ${colorMap[color as keyof typeof colorMap]}`}>
        {icon && <span className="w-8 h-8 stroke-[2]">{icon}</span>}
      </div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.25em]">{label}</p>
      <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tighter leading-none">{value}</h3>
    </div>
  );
};

export default PaymentDashboard;