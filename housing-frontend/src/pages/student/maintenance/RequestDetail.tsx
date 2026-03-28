import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequestById } from "../../../app/slices/maintenanceSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import { 
  ChevronLeft, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  Home, 
  Calendar 
} from "lucide-react";

const RequestDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedRequest, loading, error } = useSelector((state: RootState) => state.maintenance);

  useEffect(() => {
    if (id) {
      dispatch(fetchRequestById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-bold">Fetching case file...</p>
    </div>
  );

  if (error || !selectedRequest) return (
    <div className="p-10 text-center text-red-500 font-bold">
      <p>{error || "Ticket not found."}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">Go Back</button>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 mb-8 transition"
      >
        <ChevronLeft size={20} /> Back to History
      </button>
      
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Banner Section */}
        <div className="p-12 bg-gradient-to-br from-gray-900 to-blue-900 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
                 <Wrench className="text-blue-400" size={20} />
               </div>
               <span className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">Maintenance Ticket</span>
            </div>
            
            <h1 className="text-4xl font-black mb-8 leading-tight">
               #{selectedRequest.id.toString().padStart(5, '0')}
            </h1>

            <div className="flex gap-4">
               <span className={`px-5 py-2 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${
                 selectedRequest.status === 'completed' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
               }`}>
                 {selectedRequest.status === 'completed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                 {selectedRequest.status}
               </span>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-12 space-y-12">
          <section>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Description of Issue</h3>
            <p className="text-2xl font-bold text-gray-800 leading-relaxed italic">
              "{selectedRequest.description}"
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date Submitted</p>
                <p className="font-bold text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString('en-GB', { dateStyle: 'full' })}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                <Home size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Assignment</p>
                <p className="font-bold text-gray-900">Unit ID: {selectedRequest.unitId}</p>
              </div>
            </div>
          </div>

          {/* Response Box */}
          <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm">?</div>
              <p className="text-sm text-blue-800 font-bold italic">Expect a technician within 24-48 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;