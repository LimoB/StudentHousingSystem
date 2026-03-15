import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyLeases } from "../../../app/slices/leaseSlice"; // Corrected thunk
import { RootState, AppDispatch } from "../../../app/store";
import type { Lease } from "../../../api/leases";

const Leases: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { leases, loading, error } = useSelector(
    (state: RootState) => state.leases
  );
  
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Specifically fetch only the logged-in student's leases
    dispatch(fetchMyLeases());
  }, [dispatch]);

  if (loading) return (
    <div className="p-10 text-center animate-pulse">
      <p className="text-gray-500 font-medium">Retrieving lease agreements...</p>
    </div>
  );

  if (error) return <p className="p-6 text-red-500 text-center">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-black text-gray-900">My Leases</h1>
        <p className="text-gray-500">View and manage your active rental agreements.</p>
      </div>

      {leases.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100 shadow-sm">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-400 text-lg font-medium">No active leases found.</p>
          <p className="text-gray-400 text-sm">Once a booking is approved, your lease will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {leases.map((lease: any) => (
            <div 
              key={lease.id} 
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Status Indicator Sidebar */}
                <div className={`w-2 ${lease.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {lease.unit?.property?.name || "Residential Property"}
                      </h2>
                      <p className="text-blue-600 font-semibold">Unit {lease.unit?.unitNumber}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                      lease.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lease.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Start Date</p>
                      <p className="font-bold text-gray-700">
                        {new Date(lease.startDate).toLocaleDateString('en-GB', { dateStyle: 'long' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">End Date</p>
                      <p className="font-bold text-gray-700">
                        {lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-GB', { dateStyle: 'long' }) : 'Ongoing'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Monthly Rent</p>
                      <p className="font-bold text-gray-700">Ksh {Number(lease.unit?.price || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <button className="text-blue-600 font-bold hover:text-blue-800 transition text-sm flex items-center gap-2">
                      <span>📥</span> Download PDF Agreement
                    </button>
                    <p className="text-[10px] text-gray-400 font-medium italic">
                      Lease ID: #{lease.id.toString().padStart(5, '0')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leases;