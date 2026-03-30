import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../../app/slices/propertySlice";
import { fetchUnits, clearUnitError } from "../../app/slices/unitSlice";
import { RootState, AppDispatch } from "../../app/store";
import UnitCard from "../UnitCard";
import { 
  HiOutlineSquaresPlus, 
  HiOutlineHomeModern, 
  HiOutlineBuildingOffice2,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineShieldCheck
} from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";

const Units: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { properties, loading: propLoading, error: propError } = useSelector((state: RootState) => state.properties);
  const { units, loading: unitLoading, error: unitError } = useSelector((state: RootState) => state.units);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | "all">("all");

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchUnits());

    return () => {
      dispatch(clearUnitError());
    };
  }, [dispatch]);

  // 1. ROLE-BASED FILTERING
  const visibleProperties = useMemo(() => {
    if (!user || !properties) return [];
    if (isAdmin) return properties;
    
    const currentUserId = (user as any).id || (user as any).userId;
    return properties.filter(p => p.landlordId == currentUserId);
  }, [properties, user, isAdmin]);

  // 2. DATA MAPPING
  const propertiesWithUnits = useMemo(() => {
    return visibleProperties.map(property => ({
      ...property,
      currentUnits: units.filter((u) => u.propertyId === property.id)
    }));
  }, [visibleProperties, units]);

  // 3. FILTERED DISPLAY LOGIC
  const filteredDisplay = useMemo(() => {
    return selectedPropertyId === "all" 
      ? propertiesWithUnits 
      : propertiesWithUnits.filter(p => p.id === selectedPropertyId);
  }, [selectedPropertyId, propertiesWithUnits]);

  const loading = propLoading || unitLoading;
  const error = propError || unitError;

  const handleRefresh = () => {
    dispatch(fetchProperties());
    dispatch(fetchUnits());
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            {isAdmin ? "Global Inventory" : "Unit Ledger"}
          </h1>
          <p className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-[0.1em]">
            Monitoring <span className="text-blue-600">{units.length}</span> units across <span className="text-blue-600">{visibleProperties.length}</span> active assets.
          </p>
        </div>
        
        {/* ACTION BUTTON: Only show Add Unit if NOT admin */}
        {!isAdmin ? (
          <button 
            onClick={() => navigate("/landlord/units/add", { state: { propertyId: selectedPropertyId !== "all" ? selectedPropertyId : undefined } })}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-95"
          >
            <HiOutlineSquaresPlus className="w-5 h-5 stroke-[3]" />
            <span>Add New Unit</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-4 rounded-[1.25rem] text-gray-400 font-black text-[10px] uppercase tracking-widest shadow-sm">
            <HiOutlineShieldCheck className="w-5 h-5 text-purple-500" />
            <span>Read-Only Access</span>
          </div>
        )}
      </div>

      {/* Sync Error Display */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-red-900 font-black text-[10px] uppercase tracking-widest">Sync Warning</p>
              <p className="text-red-600 text-sm font-bold">{error}</p>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
          >
            <HiOutlineArrowPath className="w-4 h-4" /> Retry Sync
          </button>
        </div>
      )}

      {/* Property Filter Tabs */}
      {visibleProperties.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <button
            onClick={() => setSelectedPropertyId("all")}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${
              selectedPropertyId === "all" 
                ? "bg-gray-900 text-white border-gray-900 shadow-lg" 
                : "bg-white text-gray-400 border-gray-100 shadow-sm hover:border-blue-200 hover:text-gray-600"
            }`}
          >
            All Assets
          </button>
          {visibleProperties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => setSelectedPropertyId(prop.id)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedPropertyId === prop.id 
                  ? (isAdmin ? "bg-purple-600 border-purple-600" : "bg-blue-600 border-blue-600") + " text-white shadow-lg" 
                  : "bg-white text-gray-400 border-gray-100 shadow-sm hover:border-blue-200 hover:text-gray-600"
              }`}
            >
              {prop.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Areas */}
      {loading && units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mb-6"></div>
           <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Synchronizing Ledger...</p>
        </div>
      ) : visibleProperties.length === 0 && !loading ? (
        <div className="bg-white rounded-[3rem] py-24 text-center border border-gray-100 shadow-sm px-6">
           <HiOutlineBuildingOffice2 className="w-16 h-16 text-gray-100 mx-auto mb-6" />
           <h2 className="text-2xl font-black text-gray-900 uppercase">Registry Empty</h2>
           <p className="text-gray-400 font-bold text-sm mb-8">No active properties found in the global registry.</p>
           {!isAdmin && (
             <Link to="/landlord/properties/add" className="inline-block bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all">
                Register Property
             </Link>
           )}
        </div>
      ) : (
        <div className="space-y-32">
          {filteredDisplay.map((property) => (
            <section key={property.id} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-10">
                <div className="flex items-center space-x-6">
                  <div className={`p-5 rounded-[1.5rem] shadow-sm border ${isAdmin ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-white text-blue-600 border-gray-100'}`}>
                    <HiOutlineHomeModern className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">{property.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            {property.location}
                        </span>
                        {isAdmin && (
                            <span className="bg-purple-100 text-purple-600 text-[9px] px-2 py-0.5 rounded-lg font-black">SYSTEM ID: {property.id}</span>
                        )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-900 text-4xl font-black tabular-nums tracking-tighter">
                    {property.currentUnits.length.toString().padStart(2, '0')}
                  </span>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-1">Units Registered</p>
                </div>
              </div>

              {property.currentUnits.length > 0 ? (
                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {property.currentUnits.map((unit) => (
                    /* PASS viewOnly prop to UnitCard */
                    <UnitCard key={unit.id} unit={unit} viewOnly={isAdmin} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] py-20 text-center border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-bold text-sm mb-4 uppercase tracking-widest text-[10px]">Inventory Empty</p>
                  {!isAdmin && (
                    <button 
                      onClick={() => navigate("/landlord/units/add", { state: { propertyId: property.id } })}
                      className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:text-blue-800 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <HiOutlineSquaresPlus className="w-4 h-4" /> Initialize Units
                    </button>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Units;