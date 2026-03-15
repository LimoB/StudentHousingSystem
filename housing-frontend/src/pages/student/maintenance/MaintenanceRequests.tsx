import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMaintenanceRequests,
  fetchMyMaintenanceRequests,
  deleteMaintenanceRequestAction,
  updateMaintenanceStatusAction,
  createMaintenanceRequestAction,
} from "../../../app/slices/maintenanceSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import type { MaintenanceRequest } from "../../../api/maintenance";

const MaintenanceRequests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");

  const { requests, loading, error } = useSelector((state: RootState) => state.maintenance);
  const user = useSelector((state: RootState) => state.auth.user);
  const { leases } = useSelector((state: RootState) => state.leases); // To get the student's unit

  useEffect(() => {
    if (user?.role === "student") {
      dispatch(fetchMyMaintenanceRequests());
    } else {
      dispatch(fetchMaintenanceRequests());
    }
  }, [dispatch, user]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !leases[0]?.unitId) return;

    await dispatch(createMaintenanceRequestAction({
      unitId: leases[0].unitId,
      description
    })).unwrap();
    
    setIsModalOpen(false);
    setDescription("");
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Cancel this request?")) {
      dispatch(deleteMaintenanceRequestAction(id));
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-blue-600 font-bold">Updating records...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Maintenance</h1>
          <p className="text-gray-500">Report issues and track repairs.</p>
        </div>
        
        {user?.role === "student" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2"
          >
            <span>+</span> Report New Issue
          </button>
        )}
      </div>

      {/* Modal for reporting issue */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">New Service Request</h2>
            <form onSubmit={handleCreateRequest}>
              <textarea 
                className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none h-40 transition-all mb-6"
                placeholder="Describe the issue (e.g., The kitchen sink is leaking...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-medium">No active maintenance issues found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                    req.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {req.status}
                  </span>
                  <span className="text-xs text-gray-400">ID: #{req.id}</span>
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">{req.description}</p>
              </div>

              <div className="flex items-center gap-4">
                {user?.role === "student" && req.status === "pending" && (
                  <button 
                    onClick={() => handleDelete(req.id)}
                    className="text-red-400 hover:text-red-600 text-sm font-bold"
                  >
                    Cancel Request
                  </button>
                )}
                {user?.role !== "student" && (
                   <select 
                    value={req.status}
                    onChange={(e) => dispatch(updateMaintenanceStatusAction({ id: req.id, status: e.target.value }))}
                    className="bg-gray-50 border-none rounded-xl text-sm font-bold p-2 outline-none"
                   >
                     <option value="pending">Pending</option>
                     <option value="in-progress">In Progress</option>
                     <option value="completed">Completed</option>
                   </select>
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