import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../../app/slices/propertySlice";
import { fetchUnits, clearUnitError } from "../../app/slices/unitSlice";
import { RootState, AppDispatch } from "../../app/store";
import UnitCard from "../UnitCard";
import { 
  HiOutlineSquaresPlus, 
  HiOutlineBuildingOffice2,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlinePhoto,
  HiOutlineArrowPath
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

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

  const handleRefresh = () => {
    dispatch(fetchProperties());
    dispatch(fetchUnits());
  };

  // 1. Filter properties based on user ownership
  const visibleProperties = useMemo(() => {
    if (!user || !properties) return [];
    if (isAdmin) return properties;
    const currentUserId = user.id || (user as any).userId;
    return properties.filter(p => Number(p.landlordId) === Number(currentUserId));
  }, [properties, user, isAdmin]);

  // 2. Map units to their parent properties
  const propertiesWithUnits = useMemo(() => {
    return visibleProperties.map(property => ({
      ...property,
      currentUnits: units.filter((u) => {
          const uPid = u.propertyId || (u as any).property_id;
          return Number(uPid) === Number(property.id);
      })
    }));
  }, [visibleProperties, units]);

  // 3. Filter the grouped data based on the tab selected
  const filteredDisplay = useMemo(() => {
    return selectedPropertyId === "all" 
      ? propertiesWithUnits 
      : propertiesWithUnits.filter(p => p.id === Number(selectedPropertyId));
  }, [selectedPropertyId, propertiesWithUnits]);

  const loading = propLoading || unitLoading;
  const error = propError || unitError;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            {isAdmin ? "Global Inventory" : "Unit Ledger"}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
              Tracking <span className="text-blue-600 font-black">{units.length}</span> units across <span className="text-blue-600 font-black">{visibleProperties.length}</span> assets.
            </p>
            {/* Using handleRefresh here to solve linting error */}
            <button 
              onClick={handleRefresh}
              className="p-2 bg-white rounded-full border border-gray-100 hover:border-blue-200 transition-all shadow-sm group"
              title="Refresh Data"
            >
              <HiOutlineArrowPath className={`w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {!isAdmin ? (
          <button 
            onClick={() => navigate("/landlord/units/add", { 
                state: { propertyId: selectedPropertyId !== "all" ? selectedPropertyId : undefined } 
            })}
            className="flex items-center justify-center space-x-3 bg-gray-900 text-white px-8 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95"
          >
            <HiOutlineSquaresPlus className="w-5 h-5" />
            <span>Add New Unit</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-white border border-purple-100 px-6 py-4 rounded-2xl text-purple-600 font-black text-[10px] uppercase tracking-widest shadow-sm">
            <HiOutlineShieldCheck className="w-5 h-5" />
            <span>System Administrator Mode</span>
          </div>
        )}
      </div>

      {/* Error Alert - Using the 'error' variable here to solve linting error */}
      {error && (
        <div className="mb-10 bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <HiOutlineExclamationTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Database Sync Error</p>
            <p className="text-sm font-bold text-rose-700">{error}</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-6 py-3 bg-rose-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Asset Switcher (Tabs) */}
      {visibleProperties.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-16 overflow-x-auto pb-4 no-scrollbar">
          <button
            onClick={() => setSelectedPropertyId("all")}
            className={`px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              selectedPropertyId === "all" 
                ? "bg-blue-600 text-white shadow-xl" 
                : "bg-white text-gray-400 border border-gray-100 shadow-sm"
            }`}
          >
            Full Portfolio
          </button>
          {visibleProperties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => setSelectedPropertyId(prop.id)}
              className={`px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                selectedPropertyId === prop.id 
                  ? "bg-gray-900 text-white shadow-xl" 
                  : "bg-white text-gray-400 border-gray-100 shadow-sm"
              }`}
            >
              {prop.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Grid Content */}
      {loading && units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40">
           <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
           <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Querying Database...</p>
        </div>
      ) : (
        <div className="space-y-24">
          {filteredDisplay.map((property) => (
            <section key={property.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Asset Header Card */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-8 bg-white p-6 rounded-[3rem] border border-gray-50 shadow-sm">
                <div className="flex items-center space-x-6">
                  <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-md">
                    {property.imageUrl ? (
                      <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                        <HiOutlinePhoto size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-1">{property.name}</h2>
                    <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest flex items-center bg-gray-50 px-3 py-1 rounded-full w-fit">
                        <HiOutlineBuildingOffice2 className="mr-1.5 text-blue-500 w-3.5 h-3.5" />
                        {property.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-10 px-8 py-4 bg-gray-50 rounded-[2rem]">
                   <div className="text-center">
                      <p className="text-2xl font-black text-gray-900">{property.currentUnits.length.toString().padStart(2, '0')}</p>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Units</p>
                   </div>
                   <div className="h-8 w-px bg-gray-200" />
                   <div className="text-center">
                      <p className="text-2xl font-black text-emerald-500">{property.currentUnits.filter(u => u.isAvailable).length.toString().padStart(2, '0')}</p>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Vacant</p>
                   </div>
                </div>
              </div>

              {/* Units Grid */}
              {property.currentUnits.length > 0 ? (
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {property.currentUnits.map((unit) => (
                    <UnitCard key={unit.id} unit={unit} viewOnly={isAdmin} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] py-16 text-center border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-6">Inventory Empty</p>
                  {!isAdmin && (
                    <button 
                      onClick={() => navigate("/landlord/units/add", { state: { propertyId: property.id } })}
                      className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                    >
                      Provision Unit
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