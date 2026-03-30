import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById } from "../app/slices/propertySlice";
import { AppDispatch, RootState } from "../app/store";
import { 
  HiOutlineArrowLeft, 
  HiOutlineMapPin, 
  HiOutlinePlus, 
  HiOutlineHome, 
  HiOutlineUsers,
  HiOutlineExclamationTriangle,
  HiOutlineCube,
  HiOutlinePencil,
  HiOutlineShieldCheck
} from "react-icons/hi2";

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedProperty, loading, error } = useSelector((state: RootState) => state.properties);
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.role === 'admin';
  const basePath = isAdmin ? '/admin' : '/landlord';

  useEffect(() => {
    if (id) {
      dispatch(fetchPropertyById(Number(id)));
    }
  }, [dispatch, id]);

  const stats = useMemo(() => {
    if (!selectedProperty || !selectedProperty.units) {
      return { total: 0, occupied: 0, vacancy: 0 };
    }

    const units = selectedProperty.units;
    const total = units.length;
    const occupied = units.filter(u => u.isAvailable === false).length;
    const vacantCount = total - occupied;
    const vacancyRate = total > 0 ? Math.round((vacantCount / total) * 100) : 0;

    return { total, occupied, vacancy: vacancyRate };
  }, [selectedProperty]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Accessing Ledger...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedProperty) {
    return (
      <div className="p-10 text-center min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center">
            <HiOutlineExclamationTriangle className="w-16 h-16 text-rose-400 mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Record Not Found</h2>
            <button 
                onClick={() => navigate(`${basePath}/properties`)} 
                className="mt-6 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition-colors uppercase text-[10px] tracking-widest"
            >
                <HiOutlineArrowLeft /> Return to Portfolio
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button 
          onClick={() => navigate(`${basePath}/properties`)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
        >
          <div className="p-2.5 bg-white rounded-xl border border-gray-100 group-hover:border-blue-200 shadow-sm transition-all">
            <HiOutlineArrowLeft className="w-4 h-4 stroke-[3]" />
          </div>
          <span>Back to Registry</span>
        </button>
        
        <div className="flex gap-3">
          {!isAdmin ? (
            <>
              <button 
                onClick={() => navigate(`/landlord/properties/edit/${selectedProperty.id}`)}
                className="bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
              >
                <HiOutlinePencil className="w-4 h-4 stroke-[2.5]" /> Edit Property
              </button>
              
              <button 
                onClick={() => navigate(`/landlord/units/add`, { state: { propertyId: selectedProperty.id } })}
                className="bg-blue-600 text-white px-6 py-3.5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center gap-2"
              >
                <HiOutlinePlus className="w-4 h-4 stroke-[3]" /> Add Unit
              </button>
            </>
          ) : (
            <div className="bg-purple-50 border border-purple-100 text-purple-600 px-6 py-3.5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <HiOutlineShieldCheck className="w-4 h-4" /> Admin Oversight Mode
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Property Identity */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-50 rounded-full opacity-50" />
                <div className="w-16 h-16 bg-gray-900 rounded-[1.5rem] flex items-center justify-center text-white mb-8 shadow-xl relative z-10">
                    <HiOutlineHome className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3 leading-tight relative z-10 uppercase">
                    {selectedProperty.name}
                </h1>
                <p className="flex items-center text-gray-400 font-bold text-xs mb-10 relative z-10 uppercase tracking-widest">
                    <HiOutlineMapPin className="mr-2 text-blue-500 w-5 h-5" />
                    {selectedProperty.location}
                </p>
                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Official Description</p>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed">
                        {selectedProperty.description || "System record for " + selectedProperty.name + "."}
                    </p>
                </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Live Occupancy</p>
                <p className="text-3xl font-black text-gray-900">{stats.occupied}<span className="text-gray-200 mx-1">/</span>{stats.total}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-500">
                <HiOutlineUsers className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Vacancy Rate</p>
                <p className="text-3xl font-black text-gray-900">{stats.vacancy}%</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all text-emerald-500">
                <HiOutlineCube className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Units Inventory Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-white">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-sm">Units Inventory</h2>
              <span className="bg-gray-100 text-gray-400 text-[9px] font-black px-5 py-2.5 rounded-full uppercase tracking-[0.2em]">
                {stats.total} Registered Units
              </span>
            </div>

            <div className="p-8 overflow-x-auto">
              {selectedProperty.units && selectedProperty.units.length > 0 ? (
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                      <th className="px-8 py-2">Unit Name</th>
                      <th className="px-8 py-2 text-center">Monthly Price</th>
                      <th className="px-8 py-2 text-center">Status</th>
                      <th className="px-8 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProperty.units.map((unit: any) => (
                        <tr key={unit.id} className="group transition-all">
                          <td className="px-8 py-6 bg-white rounded-l-[2rem] border-y border-l border-gray-50 group-hover:border-blue-100 transition-colors shadow-sm">
                            <div className="font-black text-gray-900 text-lg uppercase tracking-tight">{unit.unitNumber}</div>
                            <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">{unit.type || "Standard Unit"}</div>
                          </td>

                          <td className="px-8 py-6 bg-white border-y border-gray-50 group-hover:border-blue-100 transition-colors text-center shadow-sm">
                            <div className="flex items-center justify-center text-gray-900 font-black">
                                <span className="text-blue-600 text-[10px] mr-1.5 font-black uppercase">Ksh</span> 
                                {Number(unit.price).toLocaleString()}
                            </div>
                          </td>

                          <td className="px-8 py-6 bg-white border-y border-gray-50 group-hover:border-blue-100 transition-colors text-center shadow-sm">
                            <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              unit.isAvailable 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {unit.isAvailable ? "Vacant" : "Occupied"}
                            </span>
                          </td>

                          <td className="px-8 py-6 bg-white rounded-r-[2rem] border-y border-r border-gray-50 group-hover:border-blue-100 transition-colors text-right shadow-sm">
                            <button 
                                onClick={() => navigate(`${basePath}/units/edit/${unit.id}`)}
                                className="bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-400 font-black text-[9px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95"
                            >
                              {isAdmin ? "Inspect" : "Manage"}
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-32 text-center">
                   <div className="bg-gray-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-gray-100">
                      <HiOutlineCube className="text-gray-200 w-10 h-10" />
                   </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">No Inventory</h3>
                  <p className="text-gray-400 text-sm mt-2 mb-10 max-w-xs mx-auto font-medium">This property does not have any units registered yet.</p>
                  
                  {!isAdmin && (
                    <button 
                      onClick={() => navigate(`/landlord/units/add`, { state: { propertyId: selectedProperty.id } })}
                      className="bg-gray-900 text-white px-10 py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-100"
                    >
                      + Create First Unit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;