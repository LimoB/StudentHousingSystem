import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Added toast
import { createMaintenanceRequestAction } from "../../../app/slices/maintenanceSlice";
import { fetchMyLeases } from "../../../app/slices/leaseSlice";
import { RootState, AppDispatch } from "../../../app/store";
import { ChevronLeft, Wrench, Send, AlertTriangle, AlertCircle } from "lucide-react";

const CreateRequest: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { leases } = useSelector((state: RootState) => state.leases);

  // Auto-detect active lease to get the unitId
  const activeLease = useMemo(() => 
    leases.find(l => l.status === 'active'), 
  [leases]);

  useEffect(() => {
    dispatch(fetchMyLeases());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !activeLease?.unitId) {
      toast.error("Required information is missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createMaintenanceRequestAction({
        unitId: activeLease.unitId,
        description
      })).unwrap();
      
      // Navigate back with state to trigger the toast on the list page
      navigate("/student/maintenance", { state: { submitted: true } }); 
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeLease) return (
    <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-orange-50 p-6 rounded-full mb-6">
        <AlertTriangle size={64} className="text-orange-500" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">No Active Lease</h2>
      <p className="text-gray-500 font-medium max-w-sm mx-auto">
        You can only report maintenance issues for properties where you have an active residency.
      </p>
      <button 
        onClick={() => navigate(-1)} 
        className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2"
      >
        <ChevronLeft size={20} /> Go Back
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 mb-8 transition bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm w-fit"
      >
        <ChevronLeft size={20} /> Back to History
      </button>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-900 p-10 text-white relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wrench size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/20">
                <Wrench size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Report an Issue</h1>
                <p className="text-blue-300 font-bold text-sm uppercase tracking-widest">
                  Unit {activeLease.unit?.unitNumber} — {activeLease.unit?.property?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4 ml-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                Problem Details
              </label>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">REQUIRED</span>
            </div>
            
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us exactly what's wrong... (e.g., My bedroom door handle is loose and hard to turn)"
              className="w-full p-8 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2.5rem] h-64 outline-none transition-all text-lg font-medium text-gray-700 resize-none shadow-inner"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-blue-50 rounded-[2.5rem] gap-6 border border-blue-100/50">
            <div className="flex items-start gap-3">
               <div className="mt-1 bg-blue-600 rounded-full p-1">
                <AlertCircle className="text-white" size={16} />
               </div>
               <p className="text-sm text-blue-800 font-bold leading-tight">
                 Technicians aim to respond within 24 hours. Ensure your unit is accessible.
               </p>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting || !description.trim()}
              className="w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-200"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <>Submit Ticket <Send size={18} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;