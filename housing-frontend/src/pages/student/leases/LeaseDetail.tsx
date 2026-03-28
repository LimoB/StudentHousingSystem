import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaseById } from "../../../app/slices/leaseSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import { 
  ChevronLeft, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Key, 
  Info,
  CheckCircle2
} from "lucide-react";

const LeaseDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedLease, loading, error } = useSelector((state: RootState) => state.leases);
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?.userId || (user as any)?.id;

  useEffect(() => {
    if (id) {
      dispatch(fetchLeaseById(Number(id)));
    }
  }, [dispatch, id]);

  // Security Check: Ensure the lease belongs to the current user
  const isOwner = selectedLease && Number(selectedLease.studentId) === Number(currentUserId);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-bold">Opening agreement...</p>
    </div>
  );

  if (error || (selectedLease && !isOwner)) return (
    <div className="p-20 text-center max-w-md mx-auto">
      <div className="bg-red-50 p-6 rounded-[2rem] text-red-600 mb-8">
        <ShieldCheck size={48} className="mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">Access Restricted</h2>
        <p className="font-medium text-sm">You do not have permission to view this lease or it does not exist.</p>
      </div>
      <button onClick={() => navigate("/student/leases")} className="font-black text-gray-900 flex items-center gap-2 mx-auto hover:underline">
        <ChevronLeft size={20} /> Back to my leases
      </button>
    </div>
  );

  if (!selectedLease) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 mb-8 transition bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm w-fit"
      >
        <ChevronLeft size={20} /> Back to History
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-900 p-10 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Key className="text-white" size={20} />
                </div>
                <span className="text-blue-400 font-black uppercase tracking-widest text-xs">Certified Lease Agreement</span>
              </div>
              <h1 className="text-4xl font-black mb-2">{selectedLease.unit?.property?.name}</h1>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={16} />
                <p className="font-medium">{selectedLease.unit?.property?.location || "Address not specified"}</p>
              </div>
            </div>
            
            {/* PDF Button Removed from here */}
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-10 grid md:grid-cols-3 gap-10">
          <div className="space-y-8 col-span-2">
             <div className="grid grid-cols-2 gap-8">
                <section>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Unit Allocation</p>
                  <p className="text-2xl font-black text-gray-900">Unit {selectedLease.unit?.unitNumber}</p>
                  <p className="text-sm text-gray-500 font-medium mt-1 capitalize">{selectedLease.unit?.type || "Standard"} Room</p>
                </section>
                <section>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Lease Status</p>
                  <div className="flex items-center gap-2 text-green-600 font-black uppercase text-sm">
                    <CheckCircle2 size={18} /> {selectedLease.status}
                  </div>
                </section>
             </div>

             <div className="bg-gray-50 p-8 rounded-3xl space-y-6">
                <div className="flex items-start gap-4">
                   <Calendar className="text-blue-600 mt-1" size={24} />
                   <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(selectedLease.startDate).toLocaleDateString('en-GB', { dateStyle: 'long' })}
                        <span className="mx-2 text-gray-300">→</span>
                        {selectedLease.endDate ? new Date(selectedLease.endDate).toLocaleDateString('en-GB', { dateStyle: 'long' }) : 'Ongoing'}
                      </p>
                   </div>
                </div>
                
                <div className="flex items-start gap-4">
                   <Info className="text-blue-600 mt-1" size={24} />
                   <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Contract ID</p>
                      <p className="text-sm font-mono text-gray-600">LSE-{selectedLease.id.toString().padStart(8, '0')}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Sidebar / Price Card */}
          <div className="bg-blue-600 rounded-[2rem] p-8 text-white h-fit shadow-xl shadow-blue-200">
              <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] mb-4">Rent Summary</p>
              <div className="mb-6">
                <p className="text-4xl font-black italic">Ksh {Number(selectedLease.unit?.price || 0).toLocaleString()}</p>
                <p className="text-blue-200 text-sm mt-1 opacity-80">Per academic semester</p>
              </div>
              <div className="space-y-4 pt-6 border-t border-blue-500/50">
                <div className="flex justify-between text-xs font-bold">
                  <span className="opacity-70">Property Tax</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="opacity-70">Maintenance</span>
                  <span>Included</span>
                </div>
              </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 p-8 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            This is a legally binding document between the student and the property management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaseDetail;