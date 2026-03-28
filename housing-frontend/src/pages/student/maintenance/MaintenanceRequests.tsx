import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast"; // Import toast
import {
  fetchMyMaintenanceRequests,
  deleteMaintenanceRequestAction,
} from "../../../app/slices/maintenanceSlice";
import { fetchMyLeases } from "../../../app/slices/leaseSlice";
import { RootState, AppDispatch } from "../../../app/store";
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Trash2 
} from "lucide-react";

const MaintenanceRequests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation(); // To detect if we just came from "Create" page
  
  const { requests, loading } = useSelector((state: RootState) => state.maintenance);
  const { leases } = useSelector((state: RootState) => state.leases);

  // Check for active lease to allow reporting
  const activeLease = useMemo(() => 
    leases.find(l => l.status === 'active'), 
  [leases]);

  useEffect(() => {
    dispatch(fetchMyMaintenanceRequests());
    dispatch(fetchMyLeases());

    // Show success toast if redirected from Create page with a success state
    if (location.state?.submitted) {
      toast.success("Maintenance ticket submitted successfully!", {
        duration: 4000,
        position: "top-center",
        style: { borderRadius: '1rem', background: '#111827', color: '#fff' }
      });
    }
  }, [dispatch, location]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      try {
        await dispatch(deleteMaintenanceRequestAction(id)).unwrap();
        toast.success("Request cancelled");
      } catch (err) {
        toast.error("Failed to cancel request");
      }
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-bold tracking-tight">Updating your records...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Maintenance</h1>
          <p className="text-gray-500 font-medium mt-1">Report and track repairs for your unit.</p>
        </div>
        
        {activeLease ? (
          <Link 
            to="/student/maintenance/create" 
            className="px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center gap-2"
          >
            <Plus size={20} /> Report New Issue
          </Link>
        ) : (
          <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-bold border border-orange-100 flex items-center gap-2">
            <AlertCircle size={14} /> Active lease required to report issues
          </div>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
          <Wrench size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold text-lg">Your repair history is empty.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {[...requests].reverse().map((req) => ( // Reverse to show newest first
            <div key={req.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 group hover:border-blue-200 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                    req.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {req.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {req.status || 'Pending'}
                  </div>
                  
                  <span className="text-xs text-gray-400 font-bold font-mono">
                    #{req.id?.toString().padStart(4, '0') || '----'}
                  </span>
                </div>
                <p className="text-gray-700 font-bold text-lg leading-snug line-clamp-2 italic tracking-tight">
                  "{req.description}"
                </p>
                
                <p className="text-gray-400 text-[10px] mt-3 font-black uppercase tracking-widest">
                   Logged: {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'}) : 'Just now'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link 
                  to={`/student/maintenance/${req.id}`}
                  className="bg-gray-50 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                >
                  View Details <ChevronRight size={16} />
                </Link>
                {req.status === "pending" && (
                  <button 
                    onClick={() => handleDelete(req.id)}
                    className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Cancel Request"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequests;