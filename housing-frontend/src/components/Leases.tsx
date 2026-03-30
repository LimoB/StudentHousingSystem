 
import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchLeases, 
  fetchLandlordLeases, 
  clearSelectedLease 
} from "../app/slices/leaseSlice";
import { RootState, AppDispatch } from "../app/store";
import PropertyLeaseGroup from "./PropertyLeaseGroup"; 
import TenantProfile from "./TenantProfile"; 
import { Lease } from "../api/leases";
import { 
  HiOutlineDocumentText, 
  HiOutlineArrowPath, 
  HiOutlineMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentCheck
} from "react-icons/hi2";

const Leases: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "ended">("all");
  const [selectedStudent, setSelectedStudent] = useState<Lease["student"] | null>(null);

  // Redux State
  const { user } = useSelector((state: RootState) => state.auth);
  const { leases, loading, error } = useSelector((state: RootState) => state.leases);

  const isAdmin = user?.role === "admin";
  const isLandlord = user?.role === "landlord";

  // 1. Define handleRefresh first (to avoid hoisting/TDZ errors)
  const handleRefresh = useCallback(() => {
    if (isAdmin) dispatch(fetchLeases());
    else if (isLandlord) dispatch(fetchLandlordLeases());
  }, [dispatch, isAdmin, isLandlord]);

  // 2. Initial Data Fetch
  useEffect(() => {
    if (!user) return;
    dispatch(clearSelectedLease());
    handleRefresh();
  }, [dispatch, user.role, handleRefresh, user]);

  // 3. Filter & Group Logic
  const groupedLeases = useMemo(() => {
    if (!leases) return {};

    const filtered = leases.filter((lease) => {
      const matchesSearch = 
        lease.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.unit.property.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || lease.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return filtered.reduce((acc, lease) => {
      const propName = lease.unit.property.name;
      if (!acc[propName]) acc[propName] = [];
      acc[propName].push(lease);
      return acc;
    }, {} as Record<string, typeof leases>);
  }, [leases, searchTerm, statusFilter]);

  const propertyNames = Object.keys(groupedLeases);

  // RENDER CONDITION: Show Profile View
  if (selectedStudent) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
        <TenantProfile 
          student={selectedStudent} 
          onBack={() => setSelectedStudent(null)} 
        />
      </div>
    );
  }

  // RENDER CONDITION: Loading State (Initial)
  if (loading && leases.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center bg-[#F8FAFC] min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-20 border-t-blue-600 mb-6"></div>
          <HiOutlineDocumentText className="absolute top-5 left-5 w-6 h-6 text-blue-600 animate-pulse" />
        </div>
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Syncing Global Ledger...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className={`p-2.5 rounded-xl ${isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                <HiOutlineClipboardDocumentCheck className="w-6 h-6" />
             </div>
             <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
                {isAdmin ? "Global Leases" : "Lease Registry"}
             </h1>
          </div>
          <div className="flex items-center gap-3 ml-1">
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
              {isAdmin ? "Monitoring system-wide occupancy" : `Managing agreements for your portfolio`}
            </p>
            {isAdmin && (
              <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-100">
                <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Audit Mode
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status Filter Tabs */}
          <div className="flex bg-white border border-gray-100 p-1.5 rounded-[1.25rem] shadow-sm">
            {(["all", "active", "ended"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s 
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button 
            onClick={handleRefresh}
            className="p-4 bg-white border border-gray-100 rounded-[1.25rem] text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all active:scale-90"
          >
            <HiOutlineArrowPath className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative mb-10 group">
        <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none">
          <HiOutlineMagnifyingGlass className="w-6 h-6 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Filter by tenant name, unit number, or building..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-100 py-6 pl-16 pr-8 rounded-[2.5rem] text-sm font-bold text-gray-900 shadow-sm focus:ring-0 focus:border-blue-500 focus:shadow-2xl focus:shadow-blue-900/5 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
        />
      </div>

      {error && (
        <div className="mb-8 bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-[2rem] font-bold text-sm flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => dispatch(clearSelectedLease())} className="font-black uppercase text-[10px] tracking-widest bg-white px-4 py-2 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">Dismiss</button>
        </div>
      )}

      {propertyNames.length === 0 ? (
        <div className="bg-white rounded-[3.5rem] py-32 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <HiOutlineDocumentText className="w-10 h-10 text-gray-200" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">No Agreements Found</h2>
          <p className="text-gray-400 font-bold text-sm mt-2 max-w-xs mx-auto">
            {searchTerm ? `No records matching "${searchTerm}"` : "Lease contracts will populate here once tenants are onboarded."}
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-8 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
            >
              Clear Search Query
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {propertyNames.map((name) => (
            <PropertyLeaseGroup 
              key={name} 
              propertyName={name} 
              leases={groupedLeases[name]} 
              onViewProfile={(student) => setSelectedStudent(student)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Leases;