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
  HiOutlineMagnifyingGlass
} from "react-icons/hi2";
import { format } from "date-fns";

const PaymentDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { payments, loading, error: paymentError } = useSelector((state: RootState) => state.payments);

  // 1. Data Fetching Logic
  const handleSync = useCallback(() => {
    dispatch(fetchAllPayments());
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
      
      return tenantName.includes(searchStr) || 
             propertyName.includes(searchStr) || 
             unitNum.includes(searchStr);
    });
  }, [payments, searchTerm]);

  // 3. Stats Calculation
  const stats = useMemo(() => {
    const paid = filteredPayments.filter((p: any) => 
      ["paid", "success", "completed"].includes(p.status?.toLowerCase())
    );
    const revenue = paid.reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);
    const pending = filteredPayments.filter((p: any) => p.status?.toLowerCase() === "pending").length;
    
    return { revenue, paidCount: paid.length, pendingCount: pending };
  }, [filteredPayments]);

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (["paid", "success", "completed"].includes(s)) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {user?.role === "admin" ? "Platform Finance" : "Revenue Portfolio"}
          </h1>
          <p className="text-gray-500 font-medium mt-1 italic">
            Tracking {filteredPayments.length} transactions for {user?.email}
          </p>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={loading}
          className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:shadow-md transition-all active:scale-95 shadow-sm"
        >
          <HiOutlineArrowPath className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<HiOutlineBanknotes />} label="Total Revenue" value={`KES ${stats.revenue.toLocaleString()}`} color="blue" />
        <StatCard icon={<HiOutlineCheckCircle />} label="Paid Records" value={stats.paidCount.toString()} color="emerald" />
        <StatCard icon={<HiOutlineClock />} label="Pending Actions" value={stats.pendingCount.toString()} color="amber" />
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search by tenant, property, or unit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-100 py-5 pl-16 pr-6 rounded-[2rem] text-sm font-medium shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-16">#</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tenant Detail</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Assignment</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <HiOutlineExclamationCircle className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-gray-900">
                       {paymentError ? "Sync Error" : "No Transactions Found"}
                    </h2>
                    {paymentError ? (
                      <p className="text-rose-500 font-bold mt-2 bg-rose-50 inline-block px-4 py-1 rounded-full text-xs">
                        ⚠️ {paymentError}
                      </p>
                    ) : (
                      <p className="text-gray-400 font-medium mt-1">Try adjusting your search or sync records.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p: any, idx: number) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-6 text-center text-xs font-black text-gray-300">
                      {(idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-800 text-sm">{p.student?.fullName || "Guest Tenant"}</span>
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">{p.phone || "No Phone"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 text-sm">
                          {p.booking?.unit?.property?.name || "Managed Asset"}
                        </span>
                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                          Unit {p.booking?.unit?.unitNumber || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-black text-gray-900 text-sm">
                      KES {parseFloat(p.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border inline-block tracking-tighter ${getStatusStyle(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right text-[11px] text-gray-400 font-black uppercase">
                      {p.createdAt ? format(new Date(p.createdAt), "dd MMM yyyy") : "Pending"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {loading && (
            <div className="py-20 text-center flex flex-col items-center gap-4">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 border-opacity-20 border-t-blue-600"></div>
               <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Updating Ledger...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
      color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
    }`}>
      {icon && <span className="w-7 h-7">{icon}</span>}
    </div>
    <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
    <h3 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">{value}</h3>
  </div>
);

export default PaymentDashboard;