import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById } from "../app/slices/propertySlice";
import { AppDispatch, RootState } from "../app/store";
import { 
  HiOutlineArrowLeft, 
  HiOutlineMapPin, 
  HiOutlinePlus, 
  HiOutlineUsers,
  HiOutlineExclamationTriangle,
  HiOutlineCube,
  HiOutlinePencil,
  HiOutlineShieldCheck,
  HiOutlinePhoto,
  HiOutlineBanknotes
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
      return { total: 0, occupied: 0, vacantCount: 0, vacancy: 0, potentialRevenue: 0 };
    }

    const units = selectedProperty.units;
    const total = units.length;
    const occupied = units.filter(u => u.isAvailable === false).length;
    const vacantCount = total - occupied;
    const vacancyRate = total > 0 ? Math.round((vacantCount / total) * 100) : 0;
    const potentialRevenue = units.reduce((acc, curr) => acc + Number(curr.price), 0);

    return { total, occupied, vacantCount, vacancy: vacancyRate, potentialRevenue };
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
            <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Record Not Found</h2>
            <button 
                onClick={() => navigate(`${basePath}/properties`)} 
                className="mt-6 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition-colors uppercase text-[10px] tracking-widest"
            >
                <HiOutlineArrowLeft className="stroke-[3]" /> Return to Portfolio
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
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="h-72 relative bg-gray-100 group">
                    {selectedProperty.imageUrl ? (
                        <img 
                            src={selectedProperty.imageUrl} 
                            alt={selectedProperty.name} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-slate-900 flex items-center justify-center">
                            <HiOutlinePhoto className="text-white/10 w-20 h-20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-8">
                        <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-4 py-1.5 rounded-lg uppercase tracking-[0.2em] border border-white/20">
                            {selectedProperty.status || 'Verified Registry'}
                        </span>
                    </div>
                </div>

                <div className="p-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3 uppercase leading-none">
                        {selectedProperty.name}
                    </h1>
                    <p className="flex items-center text-gray-400 font-bold text-[10px] mb-10 uppercase tracking-[0.2em]">
                        <HiOutlineMapPin className="mr-2 text-blue-500 w-4 h-4" />
                        {selectedProperty.location}
                    </p>
                    
                    <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Official Asset Description</p>
                        <p className="text-gray-600 font-medium text-sm leading-relaxed italic">
                            "{selectedProperty.description || "No descriptive notes available for this asset registry."}"
                        </p>
                    </div>
                </div>
          </div>

          {/* Performance Tiles */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Portfolio Revenue</p>
                <p className="text-2xl font-black text-gray-900">
                    <span className="text-blue-600 text-sm mr-1">KES</span>
                    {stats.potentialRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-500">
                <HiOutlineBanknotes className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Occupancy Load</p>
                <p className="text-3xl font-black text-gray-900">{stats.occupied}<span className="text-gray-200 mx-1">/</span>{stats.total}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500">
                <HiOutlineUsers className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Units Inventory Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-10 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Inventory Ledger</h2>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">Detailed Unit Breakdown</p>
              </div>
              <span className="bg-gray-900 text-white text-[9px] self-start font-black px-5 py-2.5 rounded-full uppercase tracking-[0.2em]">
                {stats.total} Total Sub-Assets
              </span>
            </div>

            <div className="p-8">
              {selectedProperty.units && selectedProperty.units.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                        <th className="px-8 py-2">Unit Identifier</th>
                        <th className="px-8 py-2 text-center">Monthly Rate</th>
                        <th className="px-8 py-2 text-center">Status</th>
                        <th className="px-8 py-2 text-right">Registry</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProperty.units.map((unit: any) => (
                            <tr key={unit.id} className="group cursor-default">
                            <td className="px-8 py-6 bg-white rounded-l-[2rem] border-y border-l border-gray-50 group-hover:border-blue-100 transition-all shadow-sm">
                                <div className="font-black text-gray-900 text-lg tracking-tight uppercase">{unit.unitNumber}</div>
                                <div className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-0.5">{unit.size || "Standard Size"}</div>
                            </td>

                            <td className="px-8 py-6 bg-white border-y border-gray-50 group-hover:border-blue-100 transition-all text-center shadow-sm">
                                <div className="text-gray-900 font-black text-sm">
                                    <span className="text-gray-300 text-[10px] mr-1">KES</span> 
                                    {Number(unit.price).toLocaleString()}
                                </div>
                            </td>

                            <td className="px-8 py-6 bg-white border-y border-gray-50 group-hover:border-blue-100 transition-all text-center shadow-sm">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                unit.isAvailable 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                {unit.isAvailable ? "Vacant" : "Occupied"}
                                </span>
                            </td>

                            <td className="px-8 py-6 bg-white rounded-r-[2rem] border-y border-r border-gray-50 group-hover:border-blue-100 transition-all text-right shadow-sm">
                                <button 
                                    onClick={() => navigate(`${basePath}/units/edit/${unit.id}`)}
                                    className="bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-900 font-black text-[9px] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all active:scale-95 border border-gray-100"
                                >
                                {isAdmin ? "Inspect" : "Update"}
                                </button>
                            </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              ) : (
                <div className="py-32 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                   <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                      <HiOutlineCube className="text-gray-200 w-12 h-12" />
                   </div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Zero Inventory</h3>
                  <p className="text-gray-400 text-xs mt-3 mb-10 max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
                    This registry entry contains no associated units at this time.
                  </p>
                  
                  {!isAdmin && (
                    <button 
                      onClick={() => navigate(`/landlord/units/add`, { state: { propertyId: selectedProperty.id } })}
                      className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-gray-200 active:scale-95"
                    >
                      + Create First Unit Record
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