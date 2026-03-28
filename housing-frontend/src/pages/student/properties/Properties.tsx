import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProperties } from "../../../app/slices/propertySlice";
import { fetchUnits } from "../../../app/slices/unitSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import { 
  MapPin, 
  ChevronRight, 
  Building2, 
  Loader2, 
  Lock,
  ArrowRight
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

  if (propLoading || unitsLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#FDFDFF]">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-500 relative z-10" size={40} />
          <div className="absolute inset-0 blur-xl bg-blue-200 opacity-50 animate-pulse"></div>
        </div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse">Refining listings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-blue-600 font-bold text-sm tracking-[0.2em] uppercase">Premium Residencies</span>
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
              Curated <span className="text-slate-400 italic font-light">Living.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm text-slate-600 font-semibold text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            {properties.length} Estates Available
          </div>
        </header>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {properties.map((property: any) => {
            const propertyUnits = units.filter((u: any) => 
              Number(u.propertyId || u.property_id) === Number(property.id)
            );
            const availableCount = propertyUnits.filter((u: any) => u.isAvailable === true).length;
            const isSoldOut = property.status === "occupied" || (propertyUnits.length > 0 && availableCount === 0);

            return (
              <div
                key={property.id}
                className={`group relative bg-white rounded-[2.5rem] p-2 transition-all duration-700 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] ${
                  isSoldOut ? "opacity-90 grayscale-[0.3]" : ""
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6 z-10">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md border ${
                    isSoldOut 
                    ? "bg-slate-100/80 text-slate-500 border-slate-200" 
                    : "bg-emerald-50/80 text-emerald-600 border-emerald-100"
                  }`}>
                    {isSoldOut ? "Fully Leased" : "Active Listing"}
                  </span>
                </div>

                <div className="p-8 flex flex-col h-full min-h-[380px]">
                  {/* Icon Area */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 ${
                    isSoldOut ? "bg-slate-50 text-slate-300" : "bg-blue-50 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white"
                  }`}>
                    {isSoldOut ? <Lock size={22} strokeWidth={2.5} /> : <Building2 size={22} strokeWidth={2.5} />}
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                      {property.name}
                    </h2>
                    <div className="flex items-center text-slate-400 font-medium text-sm">
                      <MapPin size={14} className="mr-1.5 text-blue-400" />
                      {property.location}
                    </div>
                  </div>

                  <p className="mt-6 text-slate-500 text-sm leading-relaxed font-normal line-clamp-3">
                    {property.description || "Sophisticated student living experience featuring modern amenities and strategic proximity to academic hubs."}
                  </p>

                  {/* Footer Area */}
                  <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Availability</p>
                      <p className={`text-base font-bold ${isSoldOut ? 'text-slate-400' : 'text-slate-900'}`}>
                        {isSoldOut ? (
                          "Waitlist only"
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span className="text-blue-600">{availableCount}</span>
                            <span className="text-slate-400 font-medium">Units</span>
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <Link
                      to={`/${userRole}/properties/${property.id}`}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-300 ${
                        isSoldOut 
                        ? "bg-slate-50 text-slate-400 hover:bg-slate-100" 
                        : "bg-slate-900 text-white hover:bg-blue-600 hover:gap-4 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] active:scale-95"
                      }`}
                    >
                      {isSoldOut ? "Details" : "Explore"}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Properties;