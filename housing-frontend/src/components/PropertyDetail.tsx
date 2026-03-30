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
  HiOutlinePencil} from "react-icons/hi2";

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedProperty, loading, error } = useSelector((state: RootState) => state.properties);

  useEffect(() => {
    if (id) {
      dispatch(fetchPropertyById(Number(id)));
    }
  }, [dispatch, id]);

  // STATS CALCULATION: Aligned with 'isAvailable' schema
  const stats = useMemo(() => {
    if (!selectedProperty || !selectedProperty.units) {
      return { total: 0, occupied: 0, vacancy: 0 };
    }

    const units = selectedProperty.units;
    const total = units.length;
    
    // In your schema, isAvailable: true means it's VACANT. 
    // Therefore, Occupied = !isAvailable
    const occupied = units.filter(u => u.isAvailable === false).length;
    const vacantCount = total - occupied;
    const vacancyRate = total > 0 ? Math.round((vacantCount / total) * 100) : 0;

    return { total, occupied, vacancy: vacancyRate };
  }, [selectedProperty]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Fetching Property Data</p>
        </div>
      </div>
    );
  }

  if (error || !selectedProperty) {
    return (
      <div className="p-10 text-center min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center">
            <HiOutlineExclamationTriangle className="w-16 h-16 text-red-400 mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Property Not Found</h2>
            <button 
                onClick={() => navigate("/landlord/properties")} 
                className="mt-6 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition-colors"
            >
                <HiOutlineArrowLeft /> Back to Portfolio
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
          onClick={() => navigate("/landlord/properties")}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-all group"
        >
          <div className="p-2 bg-white rounded-lg border border-gray-100 group-hover:border-blue-200 shadow-sm transition-all">
            <HiOutlineArrowLeft className="w-4 h-4 stroke-[3]" />
          </div>
          <span>Back to Portfolio</span>
        </button>
        
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
            <HiOutlinePencil className="w-4 h-4" /> Edit Property
          </button>
          <button 
            onClick={() => navigate(`/landlord/units/add`, { state: { propertyId: selectedProperty.id } })}
            className="bg-blue-600 text-white px-6 py-3.5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center gap-2"
          >
            <HiOutlinePlus className="w-4 h-4 stroke-[3]" /> Add Unit
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-100">
                    <HiOutlineHome className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 leading-tight">
                    {selectedProperty.name}
                </h1>
                <p className="flex items-center text-gray-400 font-bold text-sm mb-8">
                    <HiOutlineMapPin className="mr-2 text-blue-500 w-5 h-5" />
                    {selectedProperty.location}
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Property Description</p>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed">
                        {selectedProperty.description || "Management portal for " + selectedProperty.name}
                    </p>
                </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm">
              <HiOutlineUsers className="text-blue-500 w-5 h-5 mb-4" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Occupancy</p>
              <p className="text-2xl font-black text-gray-900">{stats.occupied}/{stats.total}</p>
            </div>
            <div className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm">
              <HiOutlineCube className="text-indigo-500 w-5 h-5 mb-4" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Vacancy Rate</p>
              <p className="text-2xl font-black text-gray-900">{stats.vacancy}%</p>
            </div>
          </div>
        </div>

        {/* Right Column: Units Inventory Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Units Inventory</h2>
              <span className="bg-gray-900 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">
                {stats.total} Total Units
              </span>
            </div>

            <div className="p-6 overflow-x-auto">
              {selectedProperty.units && selectedProperty.units.length > 0 ? (
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                      <th className="px-6 py-2">Unit Details</th>
                      <th className="px-6 py-2 text-center">Price</th>
                      <th className="px-6 py-2 text-center">Status</th>
                      <th className="px-6 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProperty.units.map((unit) => (
                        <tr key={unit.id} className="group transition-all">
                          {/* Unit Number & Size */}
                          <td className="px-6 py-5 bg-white rounded-l-2xl border-y border-l border-gray-50 group-hover:border-blue-100 transition-colors">
                            <div className="font-black text-gray-900">{unit.unitNumber}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{unit.size}</div>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-5 bg-white border-y border-gray-50 group-hover:border-blue-100 transition-colors text-center">
                            <div className="flex items-center justify-center text-gray-900 font-black text-sm">
                                <span className="text-blue-600 text-xs mr-1 font-bold">Ksh</span> 
                                {Number(unit.price).toLocaleString()}
                            </div>
                          </td>

                          {/* Status based on isAvailable */}
                          <td className="px-6 py-5 bg-white border-y border-gray-50 group-hover:border-blue-100 transition-colors text-center">
                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                              unit.isAvailable 
                              ? 'bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-50' 
                              : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                              {unit.isAvailable ? "Vacant" : "Occupied"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5 bg-white rounded-r-2xl border-y border-r border-gray-50 group-hover:border-blue-100 transition-colors text-right">
                            <button 
                                onClick={() => navigate(`/landlord/units/edit/${unit.id}`)}
                                className="bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-400 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-24 text-center">
                   <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiOutlineCube className="text-gray-300 w-8 h-8" />
                   </div>
                  <h3 className="text-lg font-black text-gray-900">No Units Registered</h3>
                  <p className="text-gray-400 text-sm mt-1 mb-8">Start by adding rooms to this property inventory.</p>
                  <button 
                    onClick={() => navigate(`/landlord/units/add`, { state: { propertyId: selectedProperty.id } })}
                    className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all"
                  >
                    + Create First Unit
                  </button>
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