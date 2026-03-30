/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMaintenanceRequests,
  fetchMyMaintenanceRequests,
  deleteMaintenanceRequestAction,
  updateMaintenanceStatusAction,
} from "../../app/slices/maintenanceSlice";

import type { RootState, AppDispatch } from "../../app/store";
import { 
  HiOutlineWrenchScrewdriver, 
  HiOutlineArrowPath, 
  HiOutlineMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineFunnel
} from "react-icons/hi2";
import MaintenanceCard from "../MaintenanceCard";
import toast from "react-hot-toast";

const MaintenanceRequests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Redux State
  const { requests, loading, error } = useSelector((state: RootState) => state.maintenance);
  const user = useSelector((state: RootState) => state.auth.user);

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const isLandlord = user?.role === "landlord";

  // 1. Define handleRefresh first (to avoid hoisting/TDZ errors)
  const handleRefresh = useCallback(() => {
    if (isStudent) {
      dispatch(fetchMyMaintenanceRequests());
    } else {
      // Admins and Landlords fetch the general pool 
      // (Assuming the backend filters landlord requests by property ownership)
      dispatch(fetchMaintenanceRequests());
    }
  }, [dispatch, isStudent]);

  // 2. Safe useEffect call
  useEffect(() => {
    if (!user) return;
    handleRefresh();
  }, [handleRefresh, user]);

  // 3. Robust Memoized Filtering
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    
    return requests.filter((req) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        req.description?.toLowerCase().includes(searchStr) ||
        req.unit?.unitNumber?.toLowerCase().includes(searchStr) ||
        req.student?.fullName?.toLowerCase().includes(searchStr);
      
      const matchesStatus = filterStatus === "all" || req.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, filterStatus]);

  const handleStatusChange = async (id: number, status: string) => {
    if (isAdmin) {
      toast.error("System Audit Mode: Admins cannot modify maintenance status.");
      return;
    }

    const tid = toast.loading(`Updating to ${status}...`);
    try {
      const result = await dispatch(updateMaintenanceStatusAction({ id, status }));
      if (updateMaintenanceStatusAction.fulfilled.match(result)) {
        toast.success("Task updated", { id: tid });
      } else {
        toast.error("Failed to update task", { id: tid });
      }
    } catch (err) {
      toast.error("Network error occurred", { id: tid });
    }
  };

  const handleDelete = async (id: number) => {
    if (isAdmin) {
      toast.error("Protected Record: Only management can delete maintenance logs.");
      return;
    }

    if (!window.confirm("Archive this request? This action is permanent.")) return;
    
    const tid = toast.loading("Archiving...");
    try {
      const result = await dispatch(deleteMaintenanceRequestAction(id));
      if (deleteMaintenanceRequestAction.fulfilled.match(result)) {
        toast.success("Record removed", { id: tid });
      }
    } catch (err) {
      toast.error("Error during deletion", { id: tid });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
              <HiOutlineWrenchScrewdriver className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
              {isAdmin ? "System Tickets" : isStudent ? "My Requests" : "Maintenance Lab"}
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-1">
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              {isAdmin ? `Monitoring ${filteredRequests.length} facility reports` : 
               isStudent ? "Track your repair status" : `Managing ${filteredRequests.length} active tickets`}
            </p>
            {isAdmin && (
              <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-100">
                <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Audit Access
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={handleRefresh}
          className="p-4 bg-white border border-gray-100 rounded-[1.25rem] text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all active:scale-90 shadow-sm"
        >
          <HiOutlineArrowPath className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Advanced Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">
        <div className="lg:col-span-3 relative group">
          <HiOutlineMagnifyingGlass className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
          <input 
            type="text"
            placeholder="Search tickets by tenant, unit number, or issue description..."
            className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-bold text-gray-900 focus:ring-0 focus:border-blue-500 focus:shadow-2xl focus:shadow-blue-900/5 outline-none transition-all placeholder:text-gray-300 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative group">
          <HiOutlineFunnel className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 pointer-events-none" />
          <select 
            className="w-full bg-white border border-gray-100 rounded-[1.5rem] pl-12 pr-4 py-5 font-black text-[10px] uppercase tracking-widest text-gray-500 outline-none shadow-sm focus:border-blue-500 appearance-none transition-all cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Global Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-[1.5rem] font-bold text-sm flex items-center gap-3 animate-in fade-in zoom-in-95">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      {/* Main List Rendering */}
      {loading && filteredRequests.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-6"></div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Syncing System Logs...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-[3.5rem] py-24 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineClipboardDocumentList className="w-10 h-10 text-gray-100" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Workbench Clear</h2>
          <p className="text-gray-400 font-bold text-sm mt-2">No maintenance tasks found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {filteredRequests.map((request) => (
            <MaintenanceCard
              key={request.id}
              request={request}
              // Pass viewOnly prop to card if it's an admin
              viewOnly={isAdmin}
              onDelete={() => handleDelete(request.id)}
              onUpdateStatus={(status) => handleStatusChange(request.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequests;