import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMaintenanceRequests,
  fetchMyMaintenanceRequests,
  deleteMaintenanceRequestAction,
  updateMaintenanceStatusAction,
} from "../../app/slices/maintenanceSlice";

import type { RootState, AppDispatch } from "../../app/store";
import { HiOutlineWrenchScrewdriver, HiOutlineArrowPath, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import MaintenanceCard from "../MaintenanceCard";

const MaintenanceRequests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { requests, loading, error } = useSelector(
    (state: RootState) => state.maintenance
  );
  const user = useSelector((state: RootState) => state.auth.user);

  // 1. Define handleRefresh BEFORE the useEffect
  // 2. Wrap in useCallback to prevent infinite loops and satisfy ESLint
  const handleRefresh = useCallback(() => {
    if (user?.role === "student") {
      dispatch(fetchMyMaintenanceRequests());
    } else {
      dispatch(fetchMaintenanceRequests());
    }
  }, [dispatch, user?.role]); // Only recreates if user role changes

  // 3. Now it's safe to call
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = 
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.student.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || req.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, filterStatus]);

  const handleStatusChange = (id: number, status: string) => {
    dispatch(updateMaintenanceStatusAction({ id, status }));
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this request record?")) {
      dispatch(deleteMaintenanceRequestAction(id));
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-bold uppercase tracking-widest text-xs">Syncing Tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {user?.role === "student" ? "My Requests" : "Maintenance Lab"}
          </h1>
          <p className="text-gray-500 font-medium mt-1 italic">
            {filteredRequests.length} tasks matching your view
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:shadow-md transition-all active:scale-95"
        >
          <HiOutlineArrowPath className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by tenant, unit, or issue..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-gray-100 rounded-2xl px-4 py-4 font-bold text-gray-600 outline-none shadow-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm">
          ⚠️ {error}
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-[3rem] py-24 text-center border border-gray-100 shadow-sm">
          <HiOutlineWrenchScrewdriver className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-gray-900">Clear Workspace</h2>
          <p className="text-gray-400 font-medium mt-2">No maintenance requests found for this selection.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {filteredRequests.map((request) => (
            <MaintenanceCard
              key={request.id}
              request={request}
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