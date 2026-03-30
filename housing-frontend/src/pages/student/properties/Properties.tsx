import { useEffect, useMemo } from "react"; // useMemo is now used below
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProperties } from "../../../app/slices/propertySlice";
import { fetchUnits } from "../../../app/slices/unitSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import { 
  MapPin, 
  Building2, 
  Loader2, 
  Lock,
  ArrowRight,
  Inbox
} from "lucide-react";

const Properties: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { properties, loading: propLoading } = useSelector((state: RootState) => state.properties);
  const { units, loading: unitsLoading } = useSelector((state: RootState) => state.units);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchUnits());
  }, [dispatch]);

  // FIX: Using useMemo to resolve the linting error and optimize performance
  const processedProperties = useMemo(() => {
    return properties.map((property: any) => {
      // Logic copied from PropertyCard
      const propertyUnits = property.units || units.filter((u: any) => {
        const uPid = u.propertyId || u.property_id || u.property?.id;
        return Number(uPid) === Number(property.id);
      });

      const unitCount = propertyUnits.length || 0;
      const availableCount = propertyUnits.filter((u: any) => 
        u.isAvailable === true || u.isAvailable === "true" || u.isAvailable === 1
      ).length;

      const isSoldOut = property.status === "occupied" || (unitCount > 0 && availableCount === 0);

      return {
        ...property,
        unitCount,
        availableCount,
        isSoldOut,
        hasUnits: unitCount > 0
      };
    });
  }, [properties, units]);

  if (propLoading && properties.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#FDFDFF]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="mt-4 text-slate-400 font-medium">Refining listings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-blue-600 font-bold text-sm tracking-[0.2em] uppercase">Premium Residencies</span>
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
              Curated <span className="text-slate-400 italic font-light">Living.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm text-slate-600 font-semibold text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            {properties.length} Estates Available
          </div>
        </header>

        {properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
            <Inbox className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium">No properties available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {processedProperties.map((property: any) => (
              <div
                key={property.id}
                className={`group relative bg-white rounded-[2.5rem] p-2 transition-all duration-500 shadow-sm hover:shadow-xl ${
                  property.isSoldOut ? "opacity-90" : ""
                }`}
              >
                <div className="absolute top-6 right-6 z-10">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                    property.isSoldOut 
                    ? "bg-slate-100 text-slate-500 border-slate-200" 
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  }`}>
                    {property.isSoldOut ? "Fully Leased" : "Active Listing"}
                  </span>
                </div>

                <div className="p-8 flex flex-col h-full min-h-[400px]">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all ${
                    property.isSoldOut ? "bg-slate-50 text-slate-300" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                  }`}>
                    {property.isSoldOut ? <Lock size={22} /> : <Building2 size={22} />}
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{property.name}</h2>
                    <div className="flex items-center text-slate-400 font-medium text-sm">
                      <MapPin size={14} className="mr-1.5 text-blue-400" />
                      {property.location}
                    </div>
                  </div>

                  <p className="mt-6 text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {property.description || "Premium student accommodation."}
                  </p>

                  <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Availability</p>
                      <div className={`text-base font-bold ${property.isSoldOut ? 'text-slate-400' : 'text-slate-900'}`}>
                        {unitsLoading && units.length === 0 && !property.units ? (
                           <span className="text-slate-300 italic animate-pulse text-xs">Checking...</span>
                        ) : property.hasUnits ? (
                           property.isSoldOut ? "Waitlist Only" : `${property.availableCount} Units Available`
                        ) : (
                           <span className="text-slate-400 font-medium text-sm">No Units Listed</span>
                        )}
                      </div>
                    </div>
                    
                    <Link
                      to={`/${userRole}/properties/${property.id}`}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
                        property.isSoldOut 
                        ? "bg-slate-50 text-slate-400" 
                        : "bg-slate-900 text-white hover:bg-blue-600 shadow-sm"
                      }`}
                    >
                      {property.isSoldOut ? "Details" : "Explore"}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;