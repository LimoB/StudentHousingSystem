import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequestById } from "../../../app/slices/maintenanceSlice";
import type { RootState, AppDispatch } from "../../../app/store";

const RequestDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedRequest, loading, error } = useSelector((state: RootState) => state.maintenance);

  useEffect(() => {
    if (id) {
      dispatch(fetchRequestById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading request...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!selectedRequest) return <div className="p-10 text-center">Request not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/student/maintenance" className="text-blue-600 font-bold mb-8 inline-block">← Back to List</Link>
      
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-10 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
             <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Case Details</span>
             <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
               selectedRequest.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
             }`}>
               {selectedRequest.status}
             </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight">
             Maintenance Ticket #{selectedRequest.id}
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Description of Issue</label>
              <p className="text-lg text-gray-700 mt-2 leading-relaxed italic">
                "{selectedRequest.description}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Submitted On</label>
                <p className="font-bold text-gray-700">{new Date(selectedRequest.createdAt).toLocaleDateString('en-GB', { dateStyle: 'full' })}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Unit Information</label>
                <p className="font-bold text-gray-700">Unit ID: {selectedRequest.unitId}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-blue-50 flex items-center justify-between">
          <p className="text-sm text-blue-700 font-medium">Our team usually responds within 24 hours.</p>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-75" />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-150" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;