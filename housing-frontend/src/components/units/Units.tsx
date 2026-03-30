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
  HiOutlineArrowPath 
} from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";

const Units: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { properties, loading: propLoading, error: propError } = useSelector((state: RootState) => state.properties);
  const { units, loading: unitLoading, error: unitError } = useSelector((state: RootState) => state.units);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | "all">("all");

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
    
    // Admin sees everything
    if (user.role === 'admin') return properties;
    
    // Landlord only sees their own
    const currentUserId = (user as any).id || (user as any).userId;
    return properties.filter(p => p.landlordId == currentUserId);
  }, [properties, user]);

  // 2. DATA MAPPING
  const propertiesWithUnits = useMemo(() => {
    return visibleProperties.map(property => ({
      ...property,
      currentUnits: units.filter((u) => u.propertyId === property.id)
    }));
  }, [visibleProperties, units]);

  const filteredDisplay = selectedPropertyId === "all" 
    ? propertiesWithUnits 
    : propertiesWithUnits.filter(p => p.id === selectedPropertyId);

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
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {user?.role === 'admin' ? "Global Unit Inventory" : "My Unit Inventory"}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Managing <span className="text-blue-600 font-bold">{units.length}</span> total units across <span className="text-blue-600 font-bold">{visibleProperties.length}</span> properties.
          </p>
        </div>
        
        {/* Role-aware Add Button */}
        <button 
          onClick={() => {
            const path = user?.role === "admin" ? "/admin/units/add" : "/landlord/units/add";
            navigate(path, { 
              state: { propertyId: selectedPropertyId !== "all" ? selectedPropertyId : undefined } 
            });
          }}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-[1.25rem] font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-95"
        >
          <HiOutlineSquaresPlus className="w-5 h-5 stroke-[3]" />
          <span>Add New Unit</span>
        </button>
      </div>

      {/* Sync Error Display */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-red-900 font-black text-sm uppercase tracking-tight">Sync Warning</p>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-colors shadow-sm"
          >
            <HiOutlineArrowPath className="w-4 h-4" /> Retry Sync
          </button>
        </div>
      )}

      {/* Property Filter Tabs */}
      {visibleProperties.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-12 no-scrollbar overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedPropertyId("all")}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedPropertyId === "all" ? "bg-gray-900 text-white shadow-lg scale-105" : "bg-white text-gray-400 border border-gray-100 shadow-sm hover:text-gray-600"
            }`}
          >
            All Properties
          </button>
          {visibleProperties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => setSelectedPropertyId(prop.id)}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedPropertyId === prop.id ? "bg-blue-600 text-white shadow-lg scale-105" : "bg-white text-gray-400 border border-gray-100 shadow-sm hover:text-gray-600"
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
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-6"></div>
           <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Refreshing Ledger...</p>
        </div>
      ) : visibleProperties.length === 0 && !loading ? (
        <div className="bg-white rounded-[3rem] py-24 text-center border border-gray-100 shadow-sm px-6">
           <HiOutlineBuildingOffice2 className="w-16 h-16 text-gray-200 mx-auto mb-6" />
           <h2 className="text-2xl font-black text-gray-900">No Assets Under Management</h2>
           <p className="text-gray-400 font-medium mb-8">Register a property to start adding units.</p>
           <Link to={user?.role === 'admin' ? "/admin/properties" : "/landlord/properties/add"} className="inline-block bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">
              {user?.role === 'admin' ? "View Properties" : "Register Property"}
           </Link>
        </div>
      ) : (
        <div className="space-y-24">
          {filteredDisplay.map((property) => (
            <section key={property.id} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-8">
                <div className="flex items-center space-x-5">
                  <div className="bg-white p-4 rounded-2xl text-blue-600 shadow-sm border border-gray-100">
                    <HiOutlineHomeModern className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{property.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{property.location}</span>
                        {user?.role === 'admin' && (
                            <span className="bg-gray-100 text-gray-500 text-[9px] px-2 py-0.5 rounded font-bold">PID: {property.id}</span>
                        )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-900 text-3xl font-black tabular-nums">{property.currentUnits.length}</span>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em]">Units</p>
                </div>
              </div>

              {property.currentUnits.length > 0 ? (
                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {property.currentUnits.map((unit) => (
                    <UnitCard key={unit.id} unit={unit} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50/40 rounded-[3rem] py-20 text-center border-2 border-dashed border-gray-200 group hover:border-blue-200 transition-colors">
                  <p className="text-gray-400 font-bold mb-4">No units found for this property.</p>
                  <Link 
                    to={user?.role === "admin" ? "/admin/units/add" : "/landlord/units/add"} 
                    state={{ propertyId: property.id }} 
                    className="text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-700"
                  >
                    + Initialize Units for {property.name}
                  </Link>
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