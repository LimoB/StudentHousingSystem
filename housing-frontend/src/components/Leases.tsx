/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchLeases, 
  fetchLandlordLeases, 
  clearSelectedLease 
} from "../app/slices/leaseSlice";
import { RootState, AppDispatch } from "../app/store";
import PropertyLeaseGroup from "./PropertyLeaseGroup"; 
import { HiOutlineDocumentText, HiOutlineArrowPath, HiOutlineMagnifyingGlass, HiOutlineFunnel } from "react-icons/hi2";

const Leases: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "ended">("all");

  const { user } = useSelector((state: RootState) => state.auth);
  const { leases, loading, error } = useSelector((state: RootState) => state.leases);

  useEffect(() => {
    if (!user) return;
    dispatch(clearSelectedLease());
    if (user.role === "admin") {
      dispatch(fetchLeases());
    } else if (user.role === "landlord") {
      dispatch(fetchLandlordLeases());
    }
  }, [dispatch, user]);

  // Combined Search, Filter, and Grouping Logic
  const groupedLeases = useMemo(() => {
    // 1. First, apply search and status filters
    const filtered = leases.filter((lease) => {
      const matchesSearch = 
        lease.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.unit.property.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || lease.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // 2. Then group the filtered results by Property Name
    return filtered.reduce((acc, lease) => {
      const propName = lease.unit.property.name;
      if (!acc[propName]) acc[propName] = [];
      acc[propName].push(lease);
      return acc;
    }, {} as Record<string, typeof leases>);
  }, [leases, searchTerm, statusFilter]);

  const propertyNames = Object.keys(groupedLeases);

  const handleRefresh = () => {
    if (user?.role === "admin") dispatch(fetchLeases());
    else if (user?.role === "landlord") dispatch(fetchLandlordLeases());
  };

  if (loading && leases.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center bg-[#F8FAFC] min-h-screen">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600 border-opacity-20 border-t-blue-600 mb-6"></div>
        <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Syncing Agreements...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {user?.role === "admin" ? "System Leases" : "Lease Management"}
          </h1>
          <p className="text-gray-500 font-medium mt-1 italic">
            Managing {leases.length} units across {propertyNames.length} properties
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Status Filter Toggle */}
          <div className="flex bg-white border border-gray-100 p-1 rounded-2xl shadow-sm">
            {(["all", "active", "ended"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button 
            onClick={handleRefresh}
            className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:shadow-md transition-all active:scale-95"
          >
            <HiOutlineArrowPath className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search by tenant name, unit #, or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-100 py-5 pl-16 pr-6 rounded-[2rem] text-sm font-medium shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all placeholder:text-gray-300"
        />
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-100 text-red-600 p-5 rounded-3xl font-bold text-sm flex items-center justify-between animate-shake">
          <span>⚠️ {error}</span>
          <button onClick={() => dispatch(clearSelectedLease())} className="underline uppercase text-[10px]">Dismiss</button>
        </div>
      )}

      {propertyNames.length === 0 ? (
        <div className="bg-white rounded-[3rem] py-24 text-center border border-gray-100 shadow-sm transition-all">
          <HiOutlineDocumentText className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-gray-900">No Matches Found</h2>
          <p className="text-gray-400 font-medium mt-2 max-w-xs mx-auto">
            {searchTerm ? `No results for "${searchTerm}"` : "Lease agreements will appear here once approved."}
          </p>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="mt-6 text-blue-600 font-bold text-sm underline">Clear Search</button>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {propertyNames.map((name) => (
            <PropertyLeaseGroup 
              key={name} 
              propertyName={name} 
              leases={groupedLeases[name]} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Leases;